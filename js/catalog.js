import {
    fetchPokemon,
    getRegionsList,
    getTypesList,
} from "./api.js";
import {
    cardElement,
} from "./dom.js";

const populeCatalog = {
    // Pega os parâmetros da URL e transforma vírgulas em array
    getValuesUrl: function () {

        const params = new URLSearchParams(window.location.search);
        const types = params.getAll('types');
        const regions = params.getAll('regions');
        const habitats = params.getAll('habitat');
        const abilities = params.getAll('ability');

        const listValues = {
            types,
            regions,
            habitats,
            abilities

        }

        return listValues;
    },

    // Faz a lógica de filtro cruzado entre tipo e região
    getPokemonsFiltered: async function (filters) {
        const { types = [], regions = [], habitats = [], abilities = [] } = filters;

        // 1. Filtra base por tipo/região como antes
        const typePromises = types.map(type =>
            fetch(`https://pokeapi.co/api/v2/type/${type}`).then(res => res.json())
        );
        const regionPromises = regions.map(region =>
            fetch(`https://pokeapi.co/api/v2/region/${region}`).then(res => res.json())
        );

        const typeResults = await Promise.all(typePromises);
        const regionResults = await Promise.all(regionPromises);

        const pokemonsByType = typeResults.flatMap(typeData =>
            typeData.pokemon.map(p => p.pokemon.name)
        );

        const pokedexUrls = regionResults.flatMap(region =>
            region.pokedexes.map(p => p.url)
        );

        const pokedexData = await Promise.all(
            pokedexUrls.map(url => fetch(url).then(res => res.json()))
        );

        const pokemonsByRegion = pokedexData.flatMap(pokedex =>
            pokedex.pokemon_entries.map(entry => entry.pokemon_species.name)
        );

        let baseList = [];

        if (regions.length) {
            baseList = pokemonsByRegion;
        } else if (types.length) {
            baseList = pokemonsByType;
        } else {
            baseList = pokemonsByRegion.length > 0 ? pokemonsByRegion : pokemonsByType;
        }

        if (regions.length && types.length) {
            baseList = baseList.filter(name => pokemonsByType.includes(name));
        }

        // 2. Agora filtra por ability/habitat pegando o Pokémon completo
        const finalFiltered = [];

        for (const name of baseList) {
            const data = await fetchPokemon(name);

            if (!data) continue;

            // 💡 Filtrar por abilities
            const abilityNames = data.abilities?.map(a => a.ability.name) || [];
            const hasAbility = abilities.length === 0 || abilities.some(ab => abilityNames.includes(ab));

            // 💡 Filtrar por habitat (requer fetch extra)
            let hasHabitat = true;
            if (habitats.length) {
                const res = await fetch(data.species.url);
                const speciesData = await res.json();
                const pokemonHabitat = speciesData.habitat?.name;
                hasHabitat = habitats.includes(pokemonHabitat);
            }

            // 💡 Tipagem dupla (AND entre types)
            const pokemonTypes = data.types?.map(t => t.type.name) || [];
            const hasTypes = types.every(t => pokemonTypes.includes(t));

            if (hasAbility && hasHabitat && hasTypes) {
                finalFiltered.push(name);
            }
        }

        return [...new Set(finalFiltered)];
    },


    // Responsável por buscar e renderizar tudo
    init: async function () {
        const filters = this.getValuesUrl();
        const results = await this.getPokemonsFiltered(filters);
        this.renderResults(results);
    },

    // Renderiza os resultados no console (ou no DOM se quiser)
    renderResults: function (pokemons) {
        pokemons.forEach(async (pokemon) => {
            const data = await fetchPokemon(pokemon);
            if (data && typeof data === 'object') {
                const card = cardElement.createPokemonCard(data);
                const destination = document.querySelector('.catalog-body .grid-pokemon');
                cardElement.appendToPokedex(card, destination);
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        card.classList.add('show');
                    });
                });
            }
        });
    },

};


const filters = {
    init: function () {
        this.renderAbilities();
        this.renderHabitats();
        this.renderTypes();
        this.renderRegions();
        this.submit();
    },

    renderAbilities: async function () {
        const res = await fetch('https://pokeapi.co/api/v2/ability?limit=100000');
        const data = await res.json();
        const abilities = data.results.map(a => a.name).sort();

        const container = document.getElementById('abilityRadioGroup');
        const searchInput = document.getElementById('abilitySearchInput');
        container.innerHTML = '';

        const selectedQueue = [];
        const wrappers = []; // referência pra todos os elementos

        this.renderLists(abilities, 'ability', container, selectedQueue, wrappers, searchInput);


    },

    renderTypes: async function () {
        const types = await getTypesList();
        if (!types) return console.warn('Nenhuma região encontrada');

        const typesList = types.results.map(a => a.name).sort();
        const container = document.querySelector('[ data-recebe="types"] .content-list');
        const searchInput = document.getElementById('typesSearchInput');
        container.innerHTML = '';

        const selectedQueue = [];
        const wrappers = []; // referência pra todos os elementos

        this.renderLists(typesList, 'types', container, selectedQueue, wrappers, searchInput);
    },

    renderRegions: async function () {
        const regions = await getRegionsList();
        if (!regions) return console.warn('Nenhuma região encontrada');

        const regionsList = regions.results.map(a => a.name).sort();
        const container = document.querySelector('[ data-recebe="regions"] .content-list');
        const searchInput = document.getElementById('regionsSearchInput');
        container.innerHTML = '';

        const selectedQueue = [];
        const wrappers = []; // referência pra todos os elementos

        this.renderLists(regionsList, 'regions', container, selectedQueue, wrappers, searchInput);
    },

    renderHabitats: async function () {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon-habitat?limit=100000');
        const data = await res.json();
        const habitats = data.results.map(a => a.name).sort();

        const container = document.getElementById('habitatRadioGroup');
        const searchInput = document.getElementById('habitatSearchInput');
        container.innerHTML = '';

        const selectedQueue = [];
        const wrappers = []; // referência pra todos os elementos
        this.renderLists(habitats, 'habitat', container, selectedQueue, wrappers, searchInput);



    },

    renderLists: function (data, type, container, selectedQueue, wrappers, searchInput) {

        data.forEach((name, index) => {
            const id = `${type}-${index}`;

            const wrapper = document.createElement('div');
            wrapper.classList.add('item-option');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = type;
            input.id = id;
            input.value = name;

            const label = document.createElement('label');
            label.setAttribute('for', id);
            label.textContent = name;

            if (type == 'types') {
                label.className = name;
            }

            if (type == 'types' || type == 'regions') {
                const img = document.createElement('img');
                img.src = `./assets/icons/${name}-icon.webp`;
                img.alt = name;
                const contentImg = document.createElement('i');
                contentImg.appendChild(img);
                label.appendChild(contentImg);
            }

            input.addEventListener('change', () => {
                if (input.checked) {
                    selectedQueue.push(input);
                    if (selectedQueue.length > 2) {
                        const toUncheck = selectedQueue.shift();
                        toUncheck.checked = false;
                    }
                } else {
                    const i = selectedQueue.indexOf(input);
                    if (i !== -1) selectedQueue.splice(i, 1);
                }
            });

            wrapper.appendChild(input);
            wrapper.appendChild(label);
            container.appendChild(wrapper);
            wrappers.push({ wrapper, name });
        });

        this.refineFilters(searchInput, container, wrappers);
    },
    refineFilters: function (searchInput, container, wrappers) {
        // 🔍 Filtro ao digitar
        searchInput.addEventListener('input', () => {
            const search = searchInput.value.toLowerCase();

            // separa entre selecionadas e não selecionadas
            const selected = [];
            const unselected = [];

            wrappers.forEach(({ wrapper, name }) => {
                const input = wrapper.querySelector('input[type="checkbox"]');

                if (input.checked) {
                    selected.push(wrapper);
                    wrapper.style.display = ''; // sempre mostra
                } else if (name.includes(search)) {
                    unselected.push(wrapper);
                    wrapper.style.display = ''; // mostra se bater no filtro
                } else {
                    wrapper.style.display = 'none'; // oculta se não bater
                }
            });

            // limpa e reordena os filhos do container
            container.innerHTML = '';
            [...selected, ...unselected].forEach(wrapper => container.appendChild(wrapper));
        });
    },

    submit: function () {
        document.getElementById('filterForm').addEventListener('submit', function (e) {
            e.preventDefault(); // impede o reload

            const formData = new FormData(this);
            const params = new URLSearchParams();

            for (const [key, value] of formData.entries()) {
                params.append(key, value);
            }

            const url = `${window.location.pathname}?${params.toString()}`;
            window.history.pushState({}, '', url);

            // Aqui você pode chamar sua função de renderização ou fetch usando os filtros
            console.log('Nova URL:', url);
            window, location.href = url;
        });
    }



};


document.addEventListener('DOMContentLoaded', () => {
    filters.init();
    populeCatalog.init();
});

import {
    fetchPokemon,
} from "./api.js";
import {
    cardElement,
    navigation
} from "./dom.js";

const populeCatalog = {
    // Pega os parâmetros da URL e transforma vírgulas em array
    getValuesUrl: function () {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);

        for (const [key, value] of searchParams.entries()) {
            if (value.includes(',')) {
                params[key] = value.split(',');
            } else {
                params[key] = value;
            }
        }
        return params;
    },

    // Faz a lógica de filtro cruzado entre tipo e região
    getPokemonsByTypeAndRegion: async function (types = [], regions = []) {
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
            return []; // ou retorna todos, se quiser
        }

        // Se ambos estiverem preenchidos, filtra a base com o outro critério
        if (regions.length && types.length) {
            baseList = baseList.filter(name => pokemonsByType.includes(name));
        }

        return [...new Set(baseList)];
    },

    // Responsável por buscar e renderizar tudo
    init: async function () {
        const filters = this.getValuesUrl();

        const types = Array.isArray(filters.types) ? filters.types : filters.types ? [filters.types] : [];
        const regions = Array.isArray(filters.regions) ? filters.regions : filters.regions ? [filters.regions] : [];


        const results = await this.getPokemonsByTypeAndRegion(types, regions);

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
        navigation.regionsList('label');
        navigation.typesList('label');
        this.renderAbilities();

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

        abilities.forEach((name, index) => {
            const id = `ability-${index}`;

            const wrapper = document.createElement('div');
            wrapper.classList.add('ability-option');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = 'abilities';
            input.id = id;
            input.value = name;

            const label = document.createElement('label');
            label.setAttribute('for', id);
            label.textContent = name;

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

        // 🔍 Filtro ao digitar
        // 🔍 Novo filtro com selecionadas sempre visíveis e no topo
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

    }



};


document.addEventListener('DOMContentLoaded', () => {
    filters.init();
    populeCatalog.init();
});

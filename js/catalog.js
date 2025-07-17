// Importações mantidas, mas fetchPokemon não é mais usado diretamente
import {
    getRegionsList,
    getTypesList,
} from "./api.js";

let currentOffset = 0;
let isLoading = false;
const limit = 20;
let isInitialized = false;

let fullPokedex = [];

const populeCatalog = {
    getValuesUrl: function () {
        const params = new URLSearchParams(window.location.search);
        const types = params.getAll('types');
        const regions = params.getAll('regions');
        const habitats = params.getAll('habitats');
        const abilities = params.getAll('abilities');
        return { types, regions, habitats, abilities };
    },

    getPokemonsFiltered: async function (filters, offset, limit) {
        const { types = [], regions = [], habitats = [], abilities = [] } = filters;

        // Se não carregou ainda, busca o JSON
        if (!fullPokedex.length) {
            const res = await fetch('../full-nenzadex.json');
            fullPokedex = await res.json();
        }

        let results = [...fullPokedex];

        if (types.length > 0) {
            results = results.filter(p => types.every(t => p.types.includes(t)));
        }

        if (regions.length > 0) {
            results = results.filter(p => regions.includes(p.region));
        }

        if (habitats.length > 0) {
            results = results.filter(p => habitats.includes(p.habitat));
        }

        if (abilities.length > 0) {
            results = results.filter(p => abilities.every(a => p.abilities.includes(a)));
        }

        // Ordena por ID (ou como quiser)
        results.sort((a, b) => a.id - b.id);

        return results;
    },

    renderResults: async function (pokemons) {
        const destination = document.querySelector('.catalog-body .grid-pokemon');
        destination.innerHTML = '';

        if (!pokemons.length) {
            document.querySelector('.alert-error').classList.add('show');
            return;
        } else {
            document.querySelector('.alert-error').classList.remove('show');
        }

        for (const data of pokemons) {
            const card = this.createPokemonCard(data);
            this.appendToPokedex(card, destination);
            requestAnimationFrame(() => {
                setTimeout(() => {
                    card.classList.add('show');
                });
            });
        }
    },
    createPokemonCard: function (pokemonRaw) {
        const pokemon = pokemonRaw;


        const card = document.createElement('a');
        card.className = `pokemons-card ${pokemon.types[0]} pb-3`;
        card.setAttribute('href', `/pokemon?id=${pokemonRaw.id}`);
        card.style.order = pokemonRaw.id;
        const PokeNumber = pokemon.id.toString().padStart(3, '0');

        card.innerHTML = `
            <div class="content-card p-relative">
                <div class="poke-type d-flex p-absolute">
                    <i class="energy d-flex justify-center align-center icon-${pokemon.types[0]}">
                    <img src="/assets/icons/${pokemon.types[0]}-icon.webp" alt="${pokemon.types[0]}">
                    </i>
                    ${pokemon.types[1] ? `
                    <i class="energy d-flex justify-center align-center icon-${pokemon.types[1]}">
                    <img src="/assets/icons/${pokemon.types[1]}-icon.webp" alt="${pokemon.types[1]}">
                    </i>` : ''}
                </div>
                <div class="poke-icon d-flex justify-center align-center p-absolute">
                    <img src="${pokemon.sprites.icon}" width="68" height="56" class="p-absolute" alt="${pokemon.name}">
                </div>
                <div class="poke-img d-flex justify-center align-center ${pokemon.types[0]}">
                    <div class="content-pokemon-image">
                        <img width="200" height="200" src="${pokemon.sprites.oficial}" class="primaria" alt="${pokemon.name}">
                    </div>
                </div>
                <div class="body-card">
                    <div class="poke-id"><span># ${PokeNumber}</span></div>
                    <div class="poke-name"><span>${pokemon.name}</span></div>
                </div>
            </div>
        `;

        return card;
    },

    appendToPokedex: function (cardElement, destination) {
        if (!destination) return;
        destination.appendChild(cardElement);
    },

    init: async function () {
        const filters = this.getValuesUrl();
        console.log('filters', filters);
        const results = await this.getPokemonsFiltered(filters);
        this.cachedResults = results;
        await this.renderResults(this.cachedResults.slice(currentOffset, currentOffset + limit));
        currentOffset += limit;
        isInitialized = true;
    },

};

const filters = {
    init: function () {
        this.renderAbilities();
        this.renderHabitats();
        this.renderTypes();
        this.renderRegions();
        this.submit();
        this.openMobileFilters();
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

        this.renderLists(abilities, 'abilities', container, selectedQueue, wrappers, searchInput);


    },

    renderTypes: async function () {
        const types = await getTypesList();
        if (!types) return console.warn('Nenhuma região encontrada');

        const typesList = types.results.map(a => a.name).sort();
        const container = document.querySelector('[ data-item="types"] .content-list');
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
        const container = document.querySelector('[ data-item="regions"] .content-list');
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

        this.renderLists(habitats, 'habitats', container, selectedQueue, wrappers, searchInput);



    },

    renderLists: function (data, type, container, selectedQueue, wrappers, searchInput) {
        const filterApplied = populeCatalog.getValuesUrl()[type];
        data.forEach((name, index) => {
            const id = `${type}-${index}`;

            const wrapper = document.createElement('div');
            if (filterApplied && filterApplied.includes(name)) {
                wrapper.classList.add('item-option', 'selected');

            } else {
                wrapper.classList.add('item-option');

            }

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = type;
            input.id = id;
            input.value = name;
            if (filterApplied && filterApplied.includes(name)) input.checked = true;

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

        this.renderActiveFilters();
    },

    renderActiveFilters: function () {
        const container = document.querySelector('.content-applied');
        const filtersContainer = container.querySelector('.active-filters');
        filtersContainer.innerHTML = '';
        const filters = populeCatalog.getValuesUrl(); // Ex: { types: [], regions: [] }

        const isEmpty = Object.values(filters).every(arr => arr.length === 0);

        if (isEmpty) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';

        for (const type in filters) {
            if (filters[type].length === 0) continue;

            const groupWrapper = document.createElement('div');
            groupWrapper.className = 'filter-group';

            const title = document.createElement('h4');
            title.className = 'filter-group-title';
            title.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ':';

            groupWrapper.appendChild(title);

            filters[type].forEach(value => {
                const tag = document.createElement('div');
                tag.className = 'active-filter';
                tag.textContent = value;
                tag.dataset.type = type;
                tag.dataset.value = value;

                tag.addEventListener('click', () => {
                    populeCatalog.removeFilterFromUrl(type, value);
                    populeCatalog.update();
                });

                groupWrapper.appendChild(tag);
            });

            filtersContainer.appendChild(groupWrapper);
        }
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
            e.preventDefault();
            const formData = new FormData(this);
            const params = new URLSearchParams();
            for (const [key, value] of formData.entries()) {
                params.append(key, value);
            }
            const url = `${window.location.pathname}?${params.toString()}`;
            window.location.href = url; // força reload — isso já reinicia o estado
        });
    },

    openMobileFilters: function () {
        document.querySelector('.show-hidden-filters h3').addEventListener('click', () => {
            document.getElementById('filterForm').classList.toggle('show');
            document.getElementById('shadowManeira').classList.toggle('show');

        });
    },



};

const observer = new IntersectionObserver(async (entries) => {
    const entry = entries[0];

    if (entry.isIntersecting && !isLoading && isInitialized) {
        isLoading = true;
        document.getElementById('scroll-sentinel').classList.add('loading');

        const results = populeCatalog.cachedResults;

        if (!results || currentOffset >= results.length) {
            document.getElementById('scroll-sentinel').classList.remove('loading');

            observer.disconnect(); // Para de observar se não há mais nada

            return;
        }

        const nextPage = results.slice(currentOffset, currentOffset + limit);

        await populeCatalog.renderResults(nextPage);
        currentOffset += limit;

        isLoading = false;
        document.getElementById('scroll-sentinel').classList.remove('loading');
    }

}, {
    rootMargin: '200px',
});

observer.observe(document.getElementById('scroll-sentinel'));

document.addEventListener('DOMContentLoaded', () => {
    filters.init();
    populeCatalog.init();
});


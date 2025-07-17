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

const regionIdToName = {
    1: "kanto",
    2: "johto",
    3: "hoenn",
    4: "sinnoh",
    5: "unova",
    6: "kalos",
    7: "alola",
    8: "galar",
    9: "hisui",
    10: "paldea"
};

const regionNameToId = {
    kanto: "1",
    johto: "2",
    hoenn: "3",
    sinnoh: "4",
    unova: "5",
    kalos: "6",
    alola: "7",
    galar: "8",
    hisui: "9",
    paldea: "10"
};

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
            results = results.filter(p => {
                const regionId = regionNameToId[p.region];
                return regions.includes(regionId);
            });
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
        const results = await this.getPokemonsFiltered(filters);
        this.cachedResults = results;
        await this.renderResults(this.cachedResults.slice(currentOffset, currentOffset + limit));
        currentOffset += limit;
        isInitialized = true;
    },

    update: async function () {
        // Reseta offset para scroll infinito
        currentOffset = 0;
        isInitialized = false;

        // Mostra loading ou spinner, se tiver
        const listContainer = document.querySelector('.grid-pokemon');
        document.getElementById('scroll-sentinel').classList.add('loading');

        // Pega os filtros atuais da URL
        const filters = this.getValuesUrl();

        // Aplica o mapeamento de nomes de região para ID (se necessário)
        if (filters.regions && filters.regions.length > 0) {
            filters.regions = filters.regions.map(r => regionNameToId[r] || r);
        }

        // Busca todos os resultados com os filtros aplicados
        const results = await this.getPokemonsFiltered(filters, 0, limit);

        // Cacheia os resultados para o scroll infinito
        this.cachedResults = results;

        // Limpa e renderiza a primeira página
        listContainer.innerHTML = '';
        document.getElementById('scroll-sentinel').classList.remove('loading');

        const firstPage = results.slice(0, limit);
        await this.renderResults(firstPage);

        // Atualiza offset e ativa scroll
        currentOffset = limit;
        isInitialized = true;

        // Reconecta o observer
        const sentinel = document.getElementById('scroll-sentinel');
        if (sentinel) observer.observe(sentinel);
    },

    removeFilterFromUrl: function (type, value) {

        console.log(type, value);
        const url = new URL(window.location);
        const params = url.searchParams;

        // Remove o valor específico da chave
        const currentValues = params.getAll(type).filter(v => v !== value);

        // Apaga tudo da chave
        params.delete(type);

        // Reinsere só os que restaram
        currentValues.forEach(v => params.append(type, v));

        // Atualiza a URL sem recarregar
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        console.log(newUrl)
        // Atualiza a URL no navegador sem recarregar
        history.replaceState(null, '', newUrl);
        // Atualiza os filtros visuais
        this.update();
        filters.renderActiveFilters();
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
        const regionsList = regions.results
            .map(a => ({
                name: a.name,
                id: a.url.split('/').filter(Boolean).pop()
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
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

        data.forEach((item, index) => {
            // Lógica especial pra 'regions'
            const isRegion = type === 'regions';
            const name = isRegion ? item.name : item;
            const value = isRegion ? item.id : item;
            const id = `${type}-${value}`;

            const wrapper = document.createElement('div');
            wrapper.classList.add('item-option');
            if (filterApplied?.includes(value)) wrapper.classList.add('selected');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = type;
            input.id = id;
            input.value = value;
            if (filterApplied?.includes(value)) input.checked = true;

            const label = document.createElement('label');
            label.setAttribute('for', id);
            label.textContent = name;

            // Se for tipo, adiciona classe e ícone
            if (type === 'types') {
                label.className = name;

                const img = document.createElement('img');
                img.src = `./assets/icons/${name}-icon.webp`;
                img.alt = name;
                const iconWrapper = document.createElement('i');
                iconWrapper.appendChild(img);
                label.appendChild(iconWrapper);
            }

            // Se for região, adiciona ícone
            if (isRegion) {
                const img = document.createElement('img');
                img.src = `./assets/icons/${name}-icon.webp`;
                img.alt = name;
                const iconWrapper = document.createElement('i');
                iconWrapper.appendChild(img);
                label.appendChild(iconWrapper);
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
                const valueId = value;
                if (type == 'regions') value = regionIdToName[value];
                const tag = document.createElement('div');
                tag.className = 'active-filter';
                tag.textContent = value;
                tag.dataset.type = type;
                tag.dataset.value = value;

                tag.addEventListener('click', () => {
                    populeCatalog.removeFilterFromUrl(type, valueId);
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

            // Atualiza a URL no navegador sem recarregar
            history.replaceState(null, '', url);


            populeCatalog.update();

            filters.renderActiveFilters();

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


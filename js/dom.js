import { parsePokemonDataCard, } from './utils/pokemon.js';
import { fetchPokemon, getRegionsList, getTypesList } from './api.js';

export const cardElement = {
    createPokemonCard: function (pokemonRaw,) {
        const pokemon = parsePokemonDataCard(pokemonRaw);

        // const card = document.createElement('div');
        // card.className = `pokemons-card ${pokemon.type1} pb-3`;
        // card.dataset.card = pokemonRaw.id;
        // card.style.order = pokemonRaw.order;

        const card = document.createElement('a');
        card.className = `pokemons-card ${pokemon.type1} pb-3`;
        card.setAttribute('href', `/pokemon?id=${pokemonRaw.id}`);
        card.style.order = pokemonRaw.id;

        card.innerHTML = `
            <div class="content-card p-relative">
                <div class="poke-type d-flex p-absolute">
                    <i class="energy d-flex justify-center align-center icon-${pokemon.type1}">
                    <img src="/assets/icons/${pokemon.type1}-icon.webp" alt="${pokemon.type1}">
                    </i>
                    ${pokemon.type2 !== 'none' ? `
                    <i class="energy d-flex justify-center align-center icon-${pokemon.type2}">
                    <img src="/assets/icons/${pokemon.type2}-icon.webp" alt="${pokemon.type2}">
                    </i>` : ''}
                </div>
                <div class="poke-icon d-flex justify-center align-center p-absolute">
                    <img src="${pokemon.icon}" width="68" height="56" class="p-absolute" alt="${pokemon.name}">
                </div>
                <div class="poke-img d-flex justify-center align-center ${pokemon.type1}">
                    <div class="content-pokemon-image">
                        <img width="200" height="200" src="${pokemon.artwork}" class="primaria" alt="${pokemon.name}">
                    </div>
                </div>
                <div class="body-card">
                    <div class="poke-id"><span># ${pokemon.id}</span></div>
                    <div class="poke-name"><span>${pokemon.name}</span></div>
                </div>
            </div>
        `;

        return card;
    },

    appendToPokedex: function (cardElement, destination) {
        if (!destination) return;
        destination.appendChild(cardElement);
    }

}



export const globalFunctions = {
    initSearch: function () {
        // Adiciona o evento de busca
        const input = document.getElementById('search');
        const form = document.querySelector('.search-form');
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const value = e.target.value.trim();
                if (value) {
                    globalFunctions.searchPokemon(value);
                }
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const value = input.value;
            if (value) {
                globalFunctions.searchPokemon(value);
            }
        });
    },

    initRandom: function () {
        const btn = document.getElementById('random-btn');
        btn?.addEventListener('click', async () => {
            const maxPokemonId = 1025;

            async function tryRandomPokemon() {
                const randomId = Math.floor(Math.random() * maxPokemonId) + 1;
                try {
                    const data = await fetchPokemon(randomId);
                    if (!data || !data.id) {
                        // Tenta novamente se não encontrar
                        return tryRandomPokemon();
                    }
                    // Redireciona somente se achou válido
                    globalFunctions.searchPokemon(data.id);
                } catch (err) {
                    // Erro tipo 404 ou falha na API — tenta de novo
                    return tryRandomPokemon();
                }
            }

            tryRandomPokemon();
        });
    },


    // busca o pokemon pelo nome
    searchPokemon: async function (name) {
        try {
            const dataPokemon = await fetchPokemon(name);

            // Verifique se os dados retornados são válidos
            if (!dataPokemon || Object.keys(dataPokemon).length === 0) {
                console.warn('Nenhum Pokémon encontrado com este nome.');
                // Adicione a lógica que deseja implementar nesse casos
                return;
            }


            window.location.href = `/pokemon?id=${dataPokemon.id}`
        } catch (error) {
            console.error('Erro ao buscar Pokémon:', error);
            // Aqui você pode adicionar lógica para lidar com erros, se necessário
        }
    },





}


export const navigation = {
    regionsList: async function () {
        const regions = await getRegionsList();
        if (!regions) return console.warn('Nenhuma região encontrada');
        this.generateList(regions.results, 'regions');
    },



    generateList: function (response, type) {
        const container = document.querySelector(`[data-recebe="${type}"] .content-list`);
        response.forEach(data => {
            const li = document.createElement('li');
            li.className = `item-level-2 ${data.name}`;
            const link = document.createElement('a');

            if (type === 'types') {
                const img = document.createElement('img');
                const icon = document.createElement('i');
                img.src = `../../assets/icons/${data.name}-icon.webp`;
                img.alt = data.name;
                icon.appendChild(img);
                link.appendChild(icon);

                const span = document.createElement('span');
                span.textContent = data.name;
                link.appendChild(span);
            } else if (type === 'regions') {
                const img = document.createElement('img');
                const icon = document.createElement('i');
                icon.className = 'region-icon';
                img.src = `../../assets/icons/${data.name}-icon.webp`;
                img.alt = data.name;
                icon.appendChild(img);
                link.appendChild(icon);

                const span = document.createElement('span');
                span.textContent = data.name;
                link.appendChild(span);
            } else {
                const span = document.createElement('span');
                span.textContent = data.name;
                link.appendChild(span);
            }

            link.href = `/catalog?${type}=${data.name}`;
            li.appendChild(link);
            container.appendChild(li);
        });
    },
    typesList: async function () {
        const types = await getTypesList();
        if (!types) return console.warn('Nenhuma região encontrada');
        this.generateList(types.results, 'types');
    }
}


setTimeout(() => {
    navigation.regionsList();
    navigation.typesList();

}, 500)

// busca um novo pokemon aleatório
async function tryRandomPokemon(attempt = 0) {
    if (attempt >= 5) {
        console.error("Falha ao encontrar um Pokémon aleatório após 5 tentativas.");
        return;
    }
    const randomId = Math.floor(Math.random() * maxPokemonId) + 1;
    try {
        const data = await fetchPokemon(randomId);
        if (!data || !data.id) {
            return tryRandomPokemon(attempt + 1);
        }
        globalFunctions.searchPokemon(data.id);
    } catch {
        return tryRandomPokemon(attempt + 1);
    }
}
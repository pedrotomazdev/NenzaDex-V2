import {
    fetchPokemon,
    fetchPokemonList,
    getPokemonRegion,
    getPokemonByTypes,
} from "./api.js";

import {
    cardElement,
    clearPokedex,
} from "./dom.js";


// primeiro carregamento dos pokemons
let initialOffset = 0;
const initialLimit = 20;
let isLoadingInitial = false;
let noMoreInitialData = false;

// Região (Geração)
let currentGenId = null;
let genOffset = 0;
const genLimit = 10;
let isLoadingGen = false;
let noMoreGenData = false;

// Tipo
let currentTypeId = null;
let typeOffset = 0;
const typeLimit = 10;
let isLoadingType = false;
let noMoreTypeData = false;

// Load Global
let isLoadingAny = false;

// Reseta todos os loads
function resetAllLoadingStates() {
    isLoadingInitial = false;
    noMoreInitialData = false;

    isLoadingGen = false;
    noMoreGenData = false;
    genOffset = 0;
    currentGenId = null;

    isLoadingType = false;
    noMoreTypeData = false;
    typeOffset = 0;
    currentTypeId = null;
}


const pokedexCore = {
    changeType: function (typeId) {
        if (typeId === currentTypeId || isLoadingAny) return;

        resetAllLoadingStates();
        currentTypeId = typeId;
        isLoadingAny = true;

        clearPokedex();
        pokedexCore.fetchPokemonTypes(typeId).finally(() => {
            isLoadingAny = false;
        });
    },


    changeGeneration: function (genId) {
        if (genId === currentGenId || isLoadingAny) return;

        resetAllLoadingStates();
        currentGenId = genId;
        isLoadingAny = true;

        clearPokedex();
        pokedexCore.fetchPokemonGen(genId).finally(() => {
            isLoadingAny = false;
        });
    },

    // carrega os primeiros 40 pokemons
    loadInitialPokemons: async function (limit = initialLimit, offset = initialOffset) {
        if (isLoadingInitial || noMoreInitialData) return;
        isLoadingInitial = true;
        // Rola a página para o topo antes de carregar os pokémons
        // Isso garante que o usuário veja os novos pokémons carregados
        document.getElementById('scroll-sentinel').classList.add('loading');

        try {
            const list = await fetchPokemonList(limit, offset); // usa os parâmetros corretamente
            if (list.results.length === 0) {
                noMoreInitialData = true;
                return;
            }
            if (offset === 0) clearPokedex();
            const names = list.results.map(p => p.name);
            const promises = names.map(name => fetchPokemon(name));
            const pokemonsData = await Promise.all(promises);

            pokemonsData.forEach((data, i) => {
                if (data) {
                    const card = cardElement.createPokemonCard(data);
                    const destination = document.querySelector('#all_poke .grid-pokemon');
                    cardElement.appendToPokedex(card, destination);
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            card.classList.add('show');
                        }, i * 100);
                    });

                } else {
                    console.error(`Pokémon not found: ${names[i]}`);
                }
            });

            initialOffset += list.results.length;
        } catch (err) {
            console.error('Error fetching Pokémon by region:', err);
        } finally {
            isLoadingInitial = false;
            document.getElementById('scroll-sentinel').classList.remove('loading');
        }
    },

    LoadPokemonOfDay: async function () {
        const qtde = 10;
        const min = 1;
        const max = 1025;
        const hoje = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
        const seedBase = [...hoje].reduce((acc, char) => acc + char.charCodeAt(0), 0);

        const numeros = new Set();
        let i = 0;

        while (numeros.size < qtde) {
            const hash = (Math.sin(seedBase + i) * 10000) % 1;
            let num = Math.floor(hash * (max - min + 1)) + min;
            if (num < 0) {
                num = (num * -1);
            }
            numeros.add(num);
            i++;
        }

        const pokemonlist = Array.from(numeros);


        pokemonlist.forEach(async (pokemon) => {
            const data = await fetchPokemon(pokemon);
            const card = cardElement.createPokemonCard(data);
            const destination = document.querySelector('.pokemon-of-day .grid-pokemon');
            cardElement.appendToPokedex(card, destination);
            requestAnimationFrame(() => {
                setTimeout(() => {
                    card.classList.add('show');
                });
            });
        });
    },

    // busca os pokemons de uma região
    fetchPokemonGen: async (genId, limit = genLimit, offset = genOffset) => {
        if (isLoadingGen || noMoreGenData) return;

        isLoadingGen = true;
        // Rola a página para o topo antes de carregar os pokémons
        // Isso garante que o usuário veja os novos pokémons carregados
        if (genOffset === 0) {
            document.getElementById('all_poke').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('scroll-sentinel').classList.add('loading');
            setTimeout(() => {
                window.scrollBy({ top: 500, behavior: 'smooth' }); // ajusta o valor conforme o quanto quer descer
            }, 500); // espera o scrollIntoView terminar
        } else {
            document.getElementById('scroll-sentinel').classList.add('loading');

        }
        try {
            const regionData = await getPokemonRegion(genId, limit, offset);

            if (regionData.length === 0) {
                noMoreGenData = true;
                return;
            }

            if (offset === 0) clearPokedex();

            const names = regionData.map(p => p.name);
            const promises = names.map(name => fetchPokemon(name));
            const pokemonsData = await Promise.all(promises);

            pokemonsData.forEach((data, i) => {
                if (data) {
                    const card = cardElement.createPokemonCard(data);
                    const destination = document.querySelector('#all_poke .grid-pokemon');

                    cardElement.appendToPokedex(card, destination);
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            card.classList.add('show');
                        }, i * 100);

                    });
                } else {
                    console.error(`Pokémon not found: ${names[i]}`);
                }
            });

            genOffset += regionData.length;
        } catch (err) {
            console.error('Error fetching Pokémon by region:', err);
        } finally {
            isLoadingGen = false;
            document.getElementById('scroll-sentinel').classList.remove('loading');

        }
    },


    // busca os pokemons por tipo
    fetchPokemonTypes: async function (typeId, limit = typeLimit, offset = typeOffset) {
        if (isLoadingType || noMoreTypeData) return;

        isLoadingType = true;

        if (typeOffset === 0) {
            // Rola a página para o topo antes de carregar os pokémons
            // Isso garante que o usuário veja os novos pokémons carregados
            document.getElementById('all_poke').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('scroll-sentinel').classList.add('loading');
            setTimeout(() => {
                window.scrollBy({ top: 500, behavior: 'smooth' }); // ajusta o valor conforme o quanto quer descer
            }, 500); // espera o scrollIntoView terminar
        }
        else {
            document.getElementById('scroll-sentinel').classList.add('loading');
        }
        try {
            const typeData = await getPokemonByTypes(typeId, limit, offset);

            if (typeData.length === 0) {
                noMoreTypeData = true;
                return;
            }

            if (offset === 0) clearPokedex();

            // Note que o pokemon vem em typeData[i].pokemon.name
            const names = typeData.map(p => p.pokemon.name);
            const promises = names.map(name => fetchPokemon(name));
            const pokemonsData = await Promise.all(promises);

            pokemonsData.forEach((data, i) => {
                if (data) {
                    const card = cardElement.createPokemonCard(data);
                    const destination = document.querySelector('#all_poke .grid-pokemon');

                    cardElement.appendToPokedex(card, destination);
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            card.classList.add('show');
                        });
                    }, i * 100);

                } else {
                    console.error(`Pokémon not found: ${names[i]}`);
                }
            });

            typeOffset += typeData.length;
        } catch (err) {
            console.error('Error fetching Pokémon by type:', err);
        } finally {
            isLoadingType = false;
            document.getElementById('scroll-sentinel').classList.remove('loading');
        }
    }

}

export const themeFunctions = {


    regionsButtons: function () {
        // Adiciona o evento de clique nos botões de região
        const regionButtons = document.querySelectorAll('[data-region]');
        regionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const region = e.currentTarget.dataset.region;
                if (!region) return;

                regionButtons.forEach(btn => btn.disabled = true);
                pokedexCore.changeGeneration(region);
                setTimeout(() => {
                    regionButtons.forEach(btn => btn.disabled = false);
                }, 2000); // Ou use um .finally para reativar, se quiser manter async
            });
        });

    },

    typeButtons: function () {
        // Adiciona o evento de clique nos botões de tipo
        const typeButtons = document.querySelectorAll('.type-btn');
        typeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const typeId = e.currentTarget.dataset.type;
                if (!typeId) return;

                typeButtons.forEach(btn => btn.disabled = true);
                pokedexCore.changeType(typeId);
                setTimeout(() => {
                    typeButtons.forEach(btn => btn.disabled = false);
                }, 2000); // Mesma observação
            });
        });
    },

    slides: function () {
        const regionSwiper = new Swiper('.list-regions', {
            slidesPerView: 2,
            spaceBetween: 10,
            lazy: {
                loadOnTransitionStart: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                1025: {
                    slidesPerView: 5,
                },

                769: {
                    slidesPerView: 4,
                },

                577: {
                    slidesPerView: 3
                }
            },
        });
    },

    scrollPosition: function () {

        window.addEventListener('scroll', () => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const pageHeight = document.documentElement.offsetHeight;

            if (scrollPosition >= pageHeight * 0.9) {
                if (currentGenId !== null) {
                    pokedexCore.fetchPokemonGen(currentGenId);
                } else if (currentTypeId !== null) {
                    pokedexCore.fetchPokemonTypes(currentTypeId);
                } else {
                    pokedexCore.loadInitialPokemons(initialLimit, initialOffset); // aqui!
                }
            }
        });
    },

}


// Inicializa o carregamento dos pokemons e adiciona o evento de busca
// quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    pokedexCore.LoadPokemonOfDay();
    pokedexCore.loadInitialPokemons();

    Object.values(themeFunctions).forEach(initFn => {
        if (typeof initFn === 'function') initFn();
    });
});


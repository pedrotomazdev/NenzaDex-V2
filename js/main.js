/*
 * Projeto: NenzaDex V2
 * Autor: Pedro Tomaz Rezende Fagundes
 * GitHub: https://github.com/pedrotomazdev
 *
 * ⚠️ Uso permitido APENAS com atribuição.
 * Proibido remover créditos ou redistribuir como se fosse autor original.
 */

import {
    globalFunctions,
} from "./dom.js";




// primeiro carregamento dos pokemons
let initialOffset = 0;
let initialLimit = 10;
let isLoadingInitial = false;


//função pra determinar se um pokemon é shiny
function isShiny(probability = 1 / 10) {
    //4096
    const randomnumber = Math.random()
    const result = randomnumber < probability;
    return result;
}

const pokedexCore = {

    // carrega os primeiros pokemon
    loadInitialPokemons: async function () {
        const limit = initialLimit;
        const offset = initialOffset;

        try {
            const fullPokedex = await globalFunctions.loadFullPokedex();
            const paginated = fullPokedex.slice(offset, offset + limit);

            if (paginated.length === 0) {
                noMoreInitialData = true;
                return;
            }

            if (offset === 0) {
                document.querySelector('#all_poke .grid-pokemon').innerHTML = '';
            };

            paginated.forEach((data, i) => {
                if (data) {
                    const card = globalFunctions.cards.createPokemonCard(data);
                    const destination = document.querySelector('#all_poke .grid-pokemon');
                   globalFunctions.cards.appendToPokedex(card, destination);
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            card.classList.add('show');
                        }, i * 100);
                    });
                }
            });

            initialOffset += limit;
        } catch (err) {
            console.error('Erro ao carregar pokémon:', err);
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

        // Seeded random generator
        function mulberry32(a) {
            return function () {
                let t = (a += 0x6D2B79F5);
                t = Math.imul(t ^ (t >>> 15), t | 1);
                t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
        }

        // Converte a data em um número para ser usado como seed
        const seed = [...hoje].reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rand = mulberry32(seed);

        const numeros = new Set();
        while (numeros.size < qtde) {
            const num = Math.floor(rand() * (max - min + 1)) + min;
            numeros.add(num);
        }

        const pokemonlist = Array.from(numeros);
        const data = await globalFunctions.loadFullPokedex();
        const filtered = data.filter(pokemon => pokemonlist.includes(pokemon.id));
        for (const pokemon of filtered) {
            const card = globalFunctions.cards.createPokemonCard(pokemon);
            const destination = document.querySelector('.pokemon-of-day .grid-pokemon');
           globalFunctions.cards.appendToPokedex(card, destination);
            requestAnimationFrame(() => {
                setTimeout(() => {
                    card.classList.add('show');
                });
            });
        }
    },

    searchTeam: async function () {
        const searchInput = document.getElementById('teamSearchInput');

        try {
            const fullPokedex = await globalFunctions.loadFullPokedex();
            const destination = document.querySelector('.list-team .grid-pokemon');

            // Escuta o input
            searchInput.addEventListener('input', () => {
                const search = searchInput.value.toLowerCase().trim();

                // Limpa resultados anteriores
                destination.innerHTML = '';

                // Se o campo estiver vazio, não faz nada
                if (search === '') {
                    populateTeam(fullPokedex);
                    return;
                };

                // Filtra pokémons cujo nome começa com o termo buscado
                const matches = fullPokedex.filter(p => p.name.toLowerCase().startsWith(search)).slice(0, 10);

                matches.forEach(pokemon => {
                    const card = globalFunctions.cards.createPokemonCard(pokemon, isShiny(), 'div', '');
                   globalFunctions.cards.appendToPokedex(card, destination);
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            card.classList.add('show');
                        });
                    });
                });
            });

            populateTeam(fullPokedex);

            function populateTeam(pokemons) {
                const paginated = pokemons.slice(0, 10);
                paginated.forEach((data, i) => {
                    if (data) {
                        const card = globalFunctions.cards.createPokemonCard(data, isShiny(), 'div', '');
                       globalFunctions.cards.appendToPokedex(card, destination);
                        requestAnimationFrame(() => {
                            setTimeout(() => {
                                card.classList.add('show');
                            }, i * 100);
                        });
                    }
                });
            }




        } catch (err) {
            console.error('Erro ao carregar pokémon:', err);
        }
    },

    generateStarterTeam: async function () {
        const storedTeam = JSON.parse(localStorage.getItem('pokemonTeam')) || [];

        if (storedTeam.length !== 0) {
            return;
        };

        const startersByGeneration = {
            kanto: ['bulbasaur', 'charmander', 'squirtle'],
            johto: ['chikorita', 'cyndaquil', 'totodile'],
            hoenn: ['treecko', 'torchic', 'mudkip'],
            sinnoh: ['turtwig', 'chimchar', 'piplup'],
            unova: ['snivy', 'tepig', 'oshawott'],
            kalos: ['chespin', 'fennekin', 'froakie'],
            alola: ['rowlet', 'litten', 'popplio'],
            galar: ['grookey', 'scorbunny', 'sobble'],
            paldea: ['sprigatito', 'fuecoco', 'quaxly'],
        };

        const container = document.querySelector('.select-starter');
        const destination = container.querySelector('.list-starter .grid-pokemon');
        container.classList.add('show');

        const fullPokedex = await globalFunctions.loadFullPokedex();

        const generations = Object.keys(startersByGeneration);
        const randomGen = generations[Math.floor(Math.random() * generations.length)];
        const startersNames = startersByGeneration[randomGen];

        const starterObjects = fullPokedex.filter(p =>
            startersNames.includes(p.name.toLowerCase())
        );


        starterObjects.forEach(pokemon => {
            const card = globalFunctions.cards.createPokemonCard(pokemon, isShiny(), 'div', 'starter');
           globalFunctions.cards.appendToPokedex(card, destination);
            requestAnimationFrame(() => {
                setTimeout(() => {
                    card.classList.add('show');
                });
            });
        });
    }
}

export const themeFunctions = {

    slides: function () {
        const regionSwiper = new Swiper('.list-regions', {
            slidesPerView: 2,
            spaceBetween: 15,
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
                if (isLoadingInitial) return; // 🔒 Proteção aqui!

                isLoadingInitial = true; // 🔒 Define antes da chamada
                pokedexCore.loadInitialPokemons();
            }
        });
    },

}


// Inicializa o carregamento dos pokemons e adiciona o evento de busca
// quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    pokedexCore.LoadPokemonOfDay();
    pokedexCore.loadInitialPokemons();
    pokedexCore.searchTeam();
    pokedexCore.generateStarterTeam();

    themeFunctions.scrollPosition();
    themeFunctions.slides();
});
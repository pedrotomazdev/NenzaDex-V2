



// primeiro carregamento dos pokemons
let initialOffset = 0;
let initialLimit = 10;
let isLoadingInitial = false;

let findinitialOffset = 0;
let findinitialLimit = 10;
let findisLoadingInitial = false;

// carrega o full pokedex uma vez somente para 
// poupar rede e deixar a aplicação mais rápida
let cachedPokedex = null;
async function loadFullPokedex() {
    if (cachedPokedex) return cachedPokedex;

    const res = await fetch('../full-nenzadex.json');
    cachedPokedex = await res.json();
    return cachedPokedex;
}

//função pra determinar se um pokemon é shiny
function isShiny(probability = 1 / 10) {
    //4096
    console.log()
    const randomnumber = Math.random()
    const result = randomnumber < probability;
    console.log(result)
    return result;
}

const pokedexCore = {

    createPokemonCard: function (pokemon, isShiny, typeContent, starter) {
        console.log('typeContent: ', typeContent)
        let card;
        if (typeContent === 'div') {
            card = document.createElement('div');
            card.setAttribute('data-id', pokemon.id);
            if (starter) {
                card.setAttribute('data-starter', 'true');
            }

            card.addEventListener('click', (e) => {
                e.preventDefault();

                if (card.dataset.starter) {
                    document.querySelector('.select-starter').classList.remove('show');
                };

                const sprite = isShiny
                    ? pokemon.sprites.animated_shiny || pokemon.sprites.animated || pokemon.sprites.icon_shiny
                    : pokemon.sprites.animated || pokemon.sprites.icon;

                this.addPokemonTeam(sprite, pokemon.id, pokemon.name, pokemon.sprites.ball_icon);
            });
        } else {
            card = document.createElement('a');
            card.setAttribute('href', `/pokemon?id=${pokemon.id}`);
        }
        card.className = `pokemons-card ${isShiny ? 'shiny' : ''} ${pokemon.types[0]}`;
        card.style.order = pokemon.id;
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
                    ${pokemon.sprites.icon !== null ? `
                    <img src="${pokemon.sprites.icon}" width="68" height="56"  onerror="this.style.display='none'"  class="p-absolute" alt="${pokemon.name}">
                    `: ''}
                </div>
                <div class="poke-img d-flex justify-center align-center ${pokemon.types[0]}">
                    <div class="content-pokemon-image">
                    ${isShiny ?
                `<img width="200" height="200" src="${pokemon.sprites.oficial_shiny !== null ? pokemon.sprites.oficial_shiny : '../assets/icons/pokeball-icon.webp'}" class="primaria" alt="${pokemon.name}">`
                :
                `<img width="200" height="200" src="${pokemon.sprites.oficial !== null ? pokemon.sprites.oficial : '../assets/icons/pokeball-icon.webp'}" class="primaria" alt="${pokemon.name}">`
            }
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

    addPokemonTeam: function (icon, id, name, ball) {
        const container = document.querySelector('.team-poke .content-list');

        // Recupera o time atual do localStorage ou inicializa um array vazio
        const team = JSON.parse(localStorage.getItem('pokemonTeam')) || [];

        // Verifica se já tem 6
        if (team.length >= 6) {
            const title = 'Your team is complete \u{2714}\u{FE0F}';
            const message = 'You can only have 6 Pokemons in your team. </br> Remove a pokemon from your team and try again.';
            const type = 'success'
            themeFunctions.popupMessage(title, message, type);
            return;
        }

        // Verifica se já existe esse pokémon no time
        if (team.find(p => p.id === id)) {
            const title = 'This Pokémon is already on your team';
            const message = "You can't " + name + " because it's already on your team.";
            const type = 'error'
            themeFunctions.popupMessage(title, message, type);
            return;
        }

        // Adiciona à UI
        const card = document.createElement('div');
        card.className = `pokemon-team`;
        card.setAttribute('data-team', id);

        const i = document.createElement('i');
        const imagePoke = document.createElement('img');
        imagePoke.className = 'pokemon-icon';
        const imageBall = document.createElement('img');
        imageBall.className = 'ball-icon';
        imagePoke.src = icon;
        imagePoke.alt = name;
        imageBall.src = ball;
        imageBall.alt = name;

        i.appendChild(imagePoke);
        i.appendChild(imageBall);
        card.appendChild(i);
        container.appendChild(card);

        // Atualiza o time no localStorage
        team.push({ icon, id, name, ball });
        localStorage.setItem('pokemonTeam', JSON.stringify(team));
    },

    loadStoredTeam: function () {
        const container = document.querySelector('.team-poke .content-list');
        const storedTeam = JSON.parse(localStorage.getItem('pokemonTeam')) || [];

        if (storedTeam.length === 0) {
            this.generateStarterTeam();
            return;
        };

        storedTeam.forEach(({ icon, id, name, ball }) => {
            const card = document.createElement('div');
            card.className = `pokemon-team`;
            card.setAttribute('data-team', id);
            const i = document.createElement('i');
            const imagePoke = document.createElement('img');
            imagePoke.className = 'pokemon-icon';
            const imageBall = document.createElement('img');
            imageBall.className = 'ball-icon';
            imagePoke.src = icon;
            imagePoke.alt = name;
            imageBall.src = ball;
            imageBall.alt = name;

            i.appendChild(imagePoke);
            i.appendChild(imageBall);
            card.appendChild(i);
            container.appendChild(card);
        });
    },

    appendToPokedex: function (cardElement, destination) {
        if (!destination) return;
        destination.appendChild(cardElement);
    },

    // carrega os primeiros pokemon
    loadInitialPokemons: async function () {
        const limit = initialLimit;
        const offset = initialOffset;

        try {
            const fullPokedex = await loadFullPokedex();
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
                    const card = this.createPokemonCard(data);
                    const destination = document.querySelector('#all_poke .grid-pokemon');
                    this.appendToPokedex(card, destination);
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
        const data = await loadFullPokedex();
        const filtered = data.filter(pokemon => pokemonlist.includes(pokemon.id));
        for (const pokemon of filtered) {
            const card = this.createPokemonCard(pokemon);
            const destination = document.querySelector('.pokemon-of-day .grid-pokemon');
            this.appendToPokedex(card, destination);
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
            const fullPokedex = await loadFullPokedex();
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
                    const card = this.createPokemonCard(pokemon, isShiny(), 'div', '');
                    this.appendToPokedex(card, destination);
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
                console.log(paginated);
                paginated.forEach((data, i) => {
                    if (data) {
                        const card = pokedexCore.createPokemonCard(data, isShiny(), 'div', '');
                        pokedexCore.appendToPokedex(card, destination);
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

        const fullPokedex = await loadFullPokedex();

        const generations = Object.keys(startersByGeneration);
        const randomGen = generations[Math.floor(Math.random() * generations.length)];
        const startersNames = startersByGeneration[randomGen];

        const starterObjects = fullPokedex.filter(p =>
            startersNames.includes(p.name.toLowerCase())
        );


        starterObjects.forEach(pokemon => {
            const card = this.createPokemonCard(pokemon, isShiny(), 'div', 'starter');
            this.appendToPokedex(card, destination);
            requestAnimationFrame(() => {
                setTimeout(() => {
                    card.classList.add('show');
                });
            });
        });
    }
}

export const themeFunctions = {
    popupMessage: function (title, subtitle, type) {
        const shadow = document.getElementById('shadowManeira');
        const popup = document.querySelector('.popup-alert');

        shadow.classList.add('show');

        popup.querySelector('h3').innerHTML = title;
        popup.querySelector('p').innerHTML = subtitle;
        popup.classList.add(type);
        popup.classList.add('show');

        setTimeout(() => {
            popup.classList.remove('show');
            shadow.classList.remove('show');
        }, 5000);

        popup.querySelector('button').addEventListener('click', () => {
            popup.classList.remove('show');
            shadow.classList.remove('show');
        });
    },

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
    pokedexCore.loadStoredTeam();

    themeFunctions.scrollPosition();
    themeFunctions.slides();
});


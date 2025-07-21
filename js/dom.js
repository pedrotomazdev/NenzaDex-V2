import {
    parsePokemonDataCard,
} from './utils/pokemon.js';
import {
    fetchPokemon,
    getRegionsList,
    getTypesList
} from './api.js';
import {
    loadStoredTeam,
    addPokemonTeam,
    deleteStoredTeam,
    initContextMenuEvents
} from './utils/team.js';
import * as search from './utils/search.js';

export const cardElement = {

    createPokemonCard: function (pokemon, isShiny, typeContent, starter) {
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

                const sprite = isShiny ?
                    pokemon.sprites.animated_shiny || pokemon.sprites.animated || pokemon.sprites.icon_shiny :
                    pokemon.sprites.animated || pokemon.sprites.icon;

                globalFunctions.addPokemonTeam(sprite, pokemon.id, pokemon.name, pokemon.sprites.ball_icon);
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

    appendToPokedex: async function (cardElement, destination) {
        if (!destination) return;
        destination.appendChild(cardElement);
    },

    appendToPokedex: function (cardElement, destination) {
        if (!destination) return;
        destination.appendChild(cardElement);
    }
}
// carrega o full pokedex uma vez somente para 
// poupar rede e deixar a aplicação mais rápida
let cachedPokedex = null;


export const globalFunctions = {
    // Gestão do Time
    initContextMenuEvents,
    loadStoredTeam,
    addPokemonTeam,
    deleteStoredTeam,

    // Gestão da busca
    search,


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
                    globalFunctions.search.searchPokemon(data.id);
                } catch (err) {
                    // Erro tipo 404 ou falha na API — tenta de novo
                    return tryRandomPokemon();
                }
            }

            tryRandomPokemon();
        });
    },

    initThemeToggle: function () {
        const toggleBtn = document.getElementById('toggle-dark');
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark-mode');
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                document.documentElement.classList.toggle('dark-mode');

                const newTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
                localStorage.setItem('theme', newTheme);
            });
        }
    },

    initMenuToggle: function () {
        document.querySelectorAll('.item-menu.has-submenu').forEach(menuItem => {
            const button = menuItem.querySelector('.content-item-menu');
            const submenu = menuItem.querySelector('.sub-item');

            if (!button || !submenu) return;

            button.addEventListener('click', () => {
                const isOpen = submenu.classList.contains('active');

                document.querySelectorAll('.sub-item.active').forEach(el => {
                    el.classList.remove('active');
                    el.previousElementSibling?.setAttribute('aria-expanded', 'false');
                });

                if (!isOpen) {
                    submenu.classList.add('active');
                    button.setAttribute('aria-expanded', 'true');
                    if (button.dataset.menu == 'search') {
                        document.getElementById('search').focus();
                    }
                } else {
                    submenu.classList.remove('active');
                    button.setAttribute('aria-expanded', 'false');
                }
            });
        });

        document.addEventListener('click', e => {
            // Fecha submenus só se o clique foi fora de qualquer .item-menu
            if (!e.target.closest('.item-menu')) {
                document.querySelectorAll('.sub-item.active').forEach(el => {
                    el.classList.remove('active');
                    el.previousElementSibling?.setAttribute('aria-expanded', 'false');
                });
            }
        });
    },

    initHeaderOnScroll: function () {
        const header = document.querySelector('header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) {
                header.classList.add('minimized');
            } else {
                header.classList.remove('minimized');
            }
        });
    },



    loadFullPokedex: async function () {
        if (cachedPokedex) return cachedPokedex;

        const res = await fetch('../full-nenzadex.json');
        cachedPokedex = await res.json();
        return cachedPokedex;
    }


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
        globalFunctions.search.searchPokemon(data.id);
    } catch {
        return tryRandomPokemon(attempt + 1);
    }
}

export function popupMessage(title, subtitle, type) {
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
}
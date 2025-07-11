import {
    fetchPokemonSpecies,
    fetchPokemon,
    getTypeEffectiveness,
    getEvolution,
    getForms
} from "./api.js";

import { cardElement } from "./dom.js";

import { groupDataPokemon, getPokemonSprites, getPokemonIcon } from './utils/pokemon.js';

const params = new URLSearchParams(window.location.search);
const paramsId = params.get("id");


export const extractDataPokemon = {
    consolidePokemonSpecies: async function () {
        try {
            const raw = await fetchPokemon(paramsId);
            const urlSpecies = raw.species.url;
            const species = await fetchPokemonSpecies(urlSpecies, paramsId);
            const pokemon = groupDataPokemon(raw, species);
            return pokemon;
        } catch (err) {
            console.error(`Erro ao buscar Pokémon ${paramsId}:`, err);
        }
    },
};

const populePage = {
    renderImages(pokemon) {
        // Trata sprites, carrossel

        // Ícone
        const image = document.createElement('img');
        image.setAttribute('src', pokemon.icon);
        document.querySelector('.content-information .poke-icon').appendChild(image);

        // Galeria
        const spritesContainer = document.querySelector('.pokemon-thumbs .swiper-wrapper');
        const mainSprites = document.querySelector('.main-image .swiper-wrapper')
        const spritesList = getPokemonSprites(pokemon.raw);
        document.querySelector('.id').textContent = `N° ${pokemon.id}`;

        spritesList.forEach(sprite => {
            // Slide para galeria principal
            const mainEl = document.createElement('div');
            mainEl.className = 'swiper-slide';
            const mainImg = document.createElement('img');
            mainImg.src = sprite;
            mainImg.alt = pokemon.name;
            mainEl.appendChild(mainImg);
            mainSprites.append(mainEl);

            // Slide para os thumbs
            const thumbEl = document.createElement('div');
            thumbEl.className = 'swiper-slide';
            const thumbImg = document.createElement('img');
            thumbImg.src = sprite;
            thumbImg.alt = pokemon.name;
            thumbEl.appendChild(thumbImg);
            spritesContainer.append(thumbEl);
        });

        setTimeout(() => {
            const thumbs = new Swiper(".pokemon-thumbs", {
                spaceBetween: 7,
                slidesPerView: 3,
                freeMode: true,
                watchSlidesProgress: true,


                breakpoints: {
                    576: {
                        slidesPerView: 5
                    }
                }


            });
            const mainImage = new Swiper(".images-pokemon .main-image", {
                spaceBetween: 10,
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                thumbs: {
                    swiper: thumbs,
                },
            });
        }, 0)

    },

    renderBasicInfo(pokemon) {
        // Nome, altura, peso, descrição

        const species = pokemon.species;

        const container = document.querySelector('.information-pokemon .content-information');
        const containerDetails = document.querySelector('.poke-data');

        const alturaMetros = pokemon.height / 10;
        const pesoKg = pokemon.weight / 10;

        // nome e descrições
        container.querySelector('.name').textContent = pokemon.name;
        if (species) {
            const entry = species.flavor_text_entries.find(e => e.language.name === 'en');
            const smallEntry = species.genera.find(e => e.language.name === 'en');
            const description = entry?.flavor_text.replace(/\f/g, ' ') || 'Descrição não disponível.';
            const smallDescription = smallEntry?.genus.replace(/\f/g, ' ') || 'Descrição simples não disponível.';
            container.querySelector('.small-description').textContent = smallDescription;
            container.querySelector('.poke-description .content p').textContent = description;

            // Habitat
            let habitatName = 'Unknown habitat';

            if (species.habitat && typeof species.habitat.name === 'string') {
                habitatName = species.habitat.name;
            }

            containerDetails.querySelector('.habitat').innerHTML = habitatName;
            containerDetails.querySelector('.habitat').setAttribute('data-habitat', habitatName);
            containerDetails.querySelector('.habitat').setAttribute('title', habitatName);
        }


        // Altura e peso
        containerDetails.querySelector('.height-item .height').textContent = `${alturaMetros.toFixed(1)} m`;
        containerDetails.querySelector('.weight-item .weight').textContent = `${pesoKg.toFixed(1)} kg`;

        // Habilidades
        pokemon.abilities.forEach(ability => {

            const el = document.createElement('div');
            el.className = 'item-ability';

            const span = document.createElement('span');
            el.setAttribute('data-hidden', ability.is_hidden);
            const abilityName = ability.ability.name.replace(/-/g, ' ');
            span.innerHTML = abilityName

            el.appendChild(span)

            containerDetails.querySelector('.abilities-item .ability').appendChild(el);
        });



    },

    renderTypes(pokemon) {
        // Lista os tipos (fire, water etc.)

        const typesContainer = document.querySelector('.poke-types .content');
        // retorna os tipos do pokémon
        pokemon.types.forEach(async type => {
            const el = document.createElement('div');
            el.className = `poke-type-item ${type}`;

            // Cria o <i> com <img> dentro
            const icon = document.createElement('i');
            const img = document.createElement('img');
            img.src = `../assets/icons/${type}-icon.webp`; // ajuste o path se necessário
            img.alt = `${type} icon`;
            icon.appendChild(img);

            // Adiciona ícone e texto ao item
            el.appendChild(icon);
            el.append(type); // adiciona o texto depois do ícone

            typesContainer.appendChild(el);
        });
    },

    async renderTypeMatchups(pokemon) {
        const types = pokemon.types;
        const { weaknesses, resistant, immunity } = await getTypeEffectiveness(types);

        const sections = [
            {
                label: 'Vulnerable against',
                data: weaknesses,
                filter: ([_, multiplier]) => multiplier > 1,
                container: document.querySelector('.poke-weaknesses')
            },
            {
                label: 'Resistant against',
                data: resistant,
                filter: ([_, multiplier]) => multiplier < 1,
                container: document.querySelector('.poke-resistances')
            },
            {
                label: 'Immune against',
                data: immunity,
                filter: ([_, isImmune]) => isImmune === true,
                container: document.querySelector('.poke-immunity')
            }
        ];

        sections.forEach(({ label, data, filter, container }) => {
            const content = container.querySelector('.content');
            const filtered = Object.entries(data).filter(filter);


            if (filtered.length > 0) {
                renderEffectList(content, data, label);
                container.style.display = '';
            } else {
                container.style.display = 'none';
            }
        });
    },

    renderStats(pokemon) {

        // Stats mapping para uso futuro
        const statsMap = {
            hp: 'PS',
            attack: 'Atack',
            defense: 'Defense',
            'special-attack': 'Special Attack',
            'special-defense': 'Special Defense',
            speed: 'Speed'
        };
        let totalValue = 0;

        Object.entries(statsMap).forEach(([key, label]) => {
            let value = Math.round(pokemon.stats[key]) + 1;
            totalValue += value;

            const percent = Math.round((value / 130) * 100);
            const pointsContainer = document.querySelector(`.item-${key} .content-pontos`);

            let i = 0;
            const interval = setInterval(() => {
                if (i <= value) {
                    pointsContainer.innerHTML = i;
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 10);

            pointsContainer.style.width = `calc(${percent}% - 100px)`;
            const totalContainer = document.querySelector('.item-total .content-total');
            animateCount(totalContainer, 0, totalValue, 10);
        });
    },

    async renderEvolutionsandForms(pokemon) {
        const species = pokemon.species;
        const evolutionChain = await getEvolution(species.evolution_chain.url);
        const formsChain = await getForms(species.varieties);
        const destinationEvolution = document.querySelector('.evolution-chain .content-evolutions');
        const destinationForms = document.querySelector('.forms-chain .content-forms');

        const evolutionButton = document.querySelector('[data-selector="evolutions"]');
        const formsButton = document.querySelector('[data-selector="forms"]');
        const idStr = pokemon.idStr;

        const hasOtherEvolution =
            evolutionChain.length > 1 &&
            (String(evolutionChain[0].id) !== idStr ||
                String(evolutionChain[0].name) !== idStr);


        if ((evolutionChain.length > 0 && hasOtherEvolution) || formsChain.length > 0) {
            document.querySelector('.secondary-block').style.display = 'block';

            if (evolutionChain.length > 0) {
                evolutionChain.forEach(poke => {
                    const evoCard = cardElement.createPokemonCard(poke);
                    cardElement.appendToPokedex(evoCard, destinationEvolution);
                    requestAnimationFrame(() => evoCard.classList.add('show'));
                });
                // evolutionContetn.classList.add('active');
                evolutionButton.classList.remove('inative');

            } else {
                // evolutionContetn.classList.remove('active');
                evolutionButton.classList.add('inative');
            }

            if (formsChain.length > 0) {
                formsChain.forEach(poke => {
                    const formCard = cardElement.createPokemonCard(poke);
                    cardElement.appendToPokedex(formCard, destinationForms);
                    requestAnimationFrame(() => formCard.classList.add('show'));
                });
                // formsContetn.classList.add('active');
                formsButton.classList.remove('inative');

            } else {
                // formsContetn.classList.remove('active');
                formsButton.classList.add('inative');
            }
        }
        else {
            document.querySelector('.secondary-block').style.display = 'none';
        }
    },

    renderCries(pokemon) {
        const player = document.querySelector('.content-information .poke-cries');
        player.src = pokemon.cry
        // player.play();
        document.querySelector('.content-information .poke-icon').addEventListener('click', () => {
            player.play();
        })
    },

    initApplication(pokemon) {
        pageRecurses.classesTypes(pokemon);
        this.renderImages(pokemon);
        this.renderBasicInfo(pokemon);
        this.renderTypes(pokemon);
        this.renderTypeMatchups(pokemon);
        this.renderStats(pokemon);
        this.renderEvolutionsandForms(pokemon);
        this.renderCries(pokemon);
        pageRecurses.tabSelectorEvent();
    }

};

const pageRecurses = {
    classesTypes(pokemon) {
        const typeMain = pokemon.type1;
        document.querySelector('body').classList.add(`type-${typeMain}`);
        document.querySelector('.content-chart').classList.add(`type-${typeMain}`);
        document.querySelector('.pokemon-thumbs').classList.add(`type-${typeMain}`);
        document.querySelector('.secondary-block').classList.add(`type-${typeMain}`);

    },
    tabSelectorEvent() {
        const selectorItems = document.querySelectorAll('.secondary-block .selections .item');
        const contentBlocks = document.querySelectorAll('.secondary-block [data-item]');

        if (selectorItems.length === 0 || contentBlocks.length === 0) return;

        // Ativa só os primeiros
        selectorItems[0].classList.add('active');
        contentBlocks[0].classList.add('active');

        // Evento de clique
        selectorItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.getAttribute('data-selector');

                selectorItems.forEach(i => i.classList.remove('active'));
                contentBlocks.forEach(block => block.classList.remove('active'));

                item.classList.add('active');

                const targetBlock = document.querySelector(`.secondary-block [data-item="${target}"]`);
                if (targetBlock) targetBlock.classList.add('active');
            });
        });
    },

    async arrowsFunctions(id) {
        const ids = [Math.round(id) - 1, Math.round(id) + 1];
        const nextArrow = document.querySelector('.next-pokemon');
        const prevArrow = document.querySelector('.prev-pokemon');
        const arrows = [prevArrow, nextArrow];

        // Busca com tratamento de erro individual
        const pokemons = await Promise.all(
            ids.map(async (pokeId) => {
                try {
                    return await fetchPokemon(pokeId);
                } catch (err) {
                    console.warn(`Falha ao buscar Pokémon ID ${pokeId}:`, err);
                    return null;
                }
            })
        );

        // Só monta os que existem
        pokemons.forEach(async (poke, index) => {
            const arrow = arrows[index];

            if (!poke || !arrow) {
                arrow?.classList.add('disabled'); // opcional: deixar botão "apagado"
                return;
            }

            const iconSrc = await getPokemonIcon(poke);
            const img = document.createElement('img');
            img.src = iconSrc;
            img.alt = poke.name;
            arrow.setAttribute('title', poke.name);
            arrow.style.setProperty('--poke-name', `"${poke.name}"`);


            arrow.querySelector('.icon-poke').innerHTML = ''; // limpa antes
            arrow.querySelector('.icon-poke').appendChild(img);
            arrow.setAttribute('data-index', `/pages/pokemon.html?id=${poke.id}`);

            arrow.addEventListener('click', function () {
                window.location.href = this.dataset.index;
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                const prevBtn = document.querySelector('.prev-pokemon');
                if (prevBtn && prevBtn.dataset.index) {
                    window.location.href = prevBtn.dataset.index;
                }
            }

            if (e.key === 'ArrowRight') {
                const nextBtn = document.querySelector('.next-pokemon');
                if (nextBtn && nextBtn.dataset.index) {
                    window.location.href = nextBtn.dataset.index;
                }
            }
        });



    },

};


document.addEventListener('DOMContentLoaded', async () => {
    const pokemon = await extractDataPokemon.consolidePokemonSpecies();

    populePage.initApplication(pokemon);
    pageRecurses.arrowsFunctions(pokemon.idStr);

});



// Funções complementares


// Gera o conteudo de fraquezas e resistências 
function renderEffectList(container, effectivenessObj, label) {
    container.innerHTML = '';

    Object.entries(effectivenessObj).forEach(([type, multiplier]) => {
        if (multiplier === 1) return; // ignora neutros

        const el = document.createElement('div');
        el.className = `poke-type-item ${type}`;

        // Aplica classe conforme o tipo de efeito
        if (multiplier === 0) {
            el.classList.add('immune');
        } else if (multiplier < 1) {
            el.classList.add('resist');
        } else if (multiplier > 1) {
            el.classList.add('weak');
        }

        const icon = document.createElement('i');
        const img = document.createElement('img');
        img.src = `../assets/icons/${type}-icon.webp`;
        img.alt = `${type} icon`;
        icon.appendChild(img);

        const spanMultiplier = document.createElement('span');
        spanMultiplier.className = 'float-multiplier';
        spanMultiplier.textContent = formatEffectivenessText(multiplier);

        const spanNameType = document.createElement('span');
        spanNameType.textContent = type;

        el.append(icon, spanMultiplier, spanNameType);
        container.appendChild(el);
    });
}


function formatEffectivenessText(multiplier) {
    if (multiplier === 0) return '0x';
    if (multiplier < 1) return `${multiplier}x`;
    if (multiplier > 1) return `${multiplier}x`;
    return `${multiplier}x`;
}


function animateCount(element, start, end, duration = 20) {
    let current = start;

    const timer = setInterval(() => {
        current++;
        element.innerHTML = current;
        if (current >= end) {
            clearInterval(timer);
        }
    }, 1);
}
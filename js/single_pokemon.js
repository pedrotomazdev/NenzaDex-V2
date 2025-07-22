import {
    globalFunctions
} from './dom.js';


const params = new URLSearchParams(window.location.search);
const paramsId = params.get("id");

const populePage = {
    renderImages(pokemon) {
        // Trata sprites, carrossel

        // Ícone
        const image = document.createElement('img');
        image.setAttribute('src', pokemon.sprites.icon);
        document.querySelector('.content-information .poke-icon').appendChild(image);

        // Galeria
        const spritesContainer = document.querySelector('.pokemon-thumbs .swiper-wrapper');
        const mainSprites = document.querySelector('.main-image .swiper-wrapper')

        const possibleSprites = [
            pokemon.sprites.oficial,
            pokemon.sprites.oficial_shiny,
            pokemon.sprites.home,
            pokemon.sprites.shiny,
            pokemon.sprites.animated,
            pokemon.sprites.animated_shiny,
        ];

        document.querySelector('.id').textContent = `N° ${pokemon.id}`;

        possibleSprites.forEach(sprite => {
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
        container.querySelector('.small-description').textContent = species.small_description;
        container.querySelector('.poke-description .content p').textContent = species.description;

        //habitat
        const habitatName = pokemon.habitat ? pokemon.habitat : 'Unknown Habitat'
        containerDetails.querySelector('.habitat').innerHTML = habitatName;
        containerDetails.querySelector('.habitat').setAttribute('data-habitat', habitatName);
        containerDetails.querySelector('.habitat').setAttribute('title', habitatName);


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

        const res = await fetch('../data/types.json');
        const allTypes = await res.json();

        const typeDataList = types.map(type => {
            const entry = allTypes.find(t => t.name === type);
            return entry?.damage_relations;
        });

        const defMap = {}; // Recebe dano de
        const offMap = {}; // Causa dano a

        typeDataList.forEach(rel => {
            // DEFENSIVO
            rel.double_damage_from.forEach(t => {
                defMap[t.name] = (defMap[t.name] ?? 1) * 2;
            });
            rel.half_damage_from.forEach(t => {
                defMap[t.name] = (defMap[t.name] ?? 1) * 0.5;
            });
            rel.no_damage_from.forEach(t => {
                defMap[t.name] = 0;
            });

            // OFENSIVO
            rel.double_damage_to.forEach(t => {
                offMap[t.name] = (offMap[t.name] ?? 1) * 2;
            });
            rel.half_damage_to.forEach(t => {
                offMap[t.name] = (offMap[t.name] ?? 1) * 0.5;
            });
            rel.no_damage_to.forEach(t => {
                offMap[t.name] = 0;
            });
        });

        // DEFENSIVO
        const weaknesses = {};
        const resistant = {};
        const immunity = {};
        for (const [type, mult] of Object.entries(defMap)) {
            if (mult === 0) immunity[type] = true;
            else if (mult > 1) weaknesses[type] = mult;
            else if (mult < 1) resistant[type] = mult;
        }

        // OFENSIVO
        const strongAgainst = {};
        for (const [type, mult] of Object.entries(offMap)) {
            if (mult > 1) strongAgainst[type] = mult;
        }

        const full = {
            weaknesses,
            resistant,
            immunity,
            strongAgainst,
        };

        const sections = [{
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
                label: 'Strong against',
                data: strongAgainst,
                filter: ([_, multiplier]) => multiplier < 3,
                container: document.querySelector('.poke-strong')
            },
            {
                label: 'Immune against',
                data: immunity,
                filter: ([_, isImmune]) => isImmune === true,
                container: document.querySelector('.poke-immunity')
            }
        ];

        sections.forEach(({
            label,
            data,
            filter,
            container
        }) => {
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

        const fullPokedex = await globalFunctions.loadFullPokedex();
        const evolutionChain = pokemon.evolution.full_chain;
        const formsChain = pokemon.species.varieties
        const evolutionButton = document.querySelector('[data-selector="evolutions"]');
        const formsButton = document.querySelector('[data-selector="forms"]');

        if (evolutionChain.length > 1) {
            evolutionChain.forEach((evo) => {

                const poke = fullPokedex.find(p => p.id === Number(evo.id))
                const card = globalFunctions.cards.createPokemonCard(poke, false, 'div', '');
                const destination = document.querySelector('.evolution-chain .content-evolutions');
                globalFunctions.cards.appendToPokedex(card, destination);
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        card.classList.add('show');
                    });
                });

            })
        } else {
            evolutionButton.classList.add('inative');
            document.querySelector('.evolution-chain').classList.remove('active');
        }

        if (formsChain.length > 1) {
            formsChain.forEach((form) => {
                const url = form.pokemon.url;
                const parts = url.split('/').filter(Boolean);
                const id = parts[parts.length - 1];
                const poke = fullPokedex.find(p => p.id === Number(id));
                const card = globalFunctions.cards.createPokemonCard(poke, false, 'div', '');
                const destination = document.querySelector('.forms-chain .content-forms');
                globalFunctions.cards.appendToPokedex(card, destination);
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        card.classList.add('show');
                    });
                });
            });
        } else {
            formsButton.classList.add('inative');
            document.querySelector('.forms-chain').classList.remove('active');
        }

        if (evolutionChain.length <= 1 && formsChain.length <= 1) {
            document.querySelector('.secondary-block').style.display = 'none';
        } else if (evolutionChain.length <= 1 && formsChain.length > 1) {
            document.querySelector('.forms-chain').classList.add('active');
        }

    },

    renderCries(pokemon) {
        const player = document.querySelector('.content-information .poke-cries');
        player.src = pokemon.cries.latest;
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
        const typeMain = pokemon.types[0];
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
        const fullPokedex = await globalFunctions.loadFullPokedex();

        ids.forEach((id, index) => {
            const pokemon = fullPokedex.find(p => p.id === Number(id));
            const arrow = arrows[index];
            if (!pokemon || !arrow) {
                arrow?.classList.add('disabled'); // opcional: deixar botão "apagado"
                return;
            }

            const iconSrc = pokemon.sprites.icon;
            const img = document.createElement('img');
            img.src = iconSrc;
            img.alt = pokemon.name;
            arrow.setAttribute('title', pokemon.name);
            arrow.style.setProperty('--poke-name', `"${pokemon.name}"`);


            arrow.querySelector('.icon-poke').innerHTML = ''; // limpa antes
            arrow.querySelector('.icon-poke').appendChild(img);
            arrow.setAttribute('data-index', `/pokemon?id=${pokemon.id}`);

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
    const fullPokedex = await globalFunctions.loadFullPokedex();
    const pokemon = fullPokedex.find(poke => poke.id === Number(paramsId));
    populePage.initApplication(pokemon);
    pageRecurses.arrowsFunctions(pokemon.id);

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
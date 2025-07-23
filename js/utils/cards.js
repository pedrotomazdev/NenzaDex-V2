import {
    addPokemonTeam
} from "./team.js";

export function testImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({
            url,
            ok: true
        });
        img.onerror = () => resolve({
            url,
            ok: false
        });
        img.src = url;
    });
};

export function createPokemonCard(pokemon, isShiny, typeContent, starter) {
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

        });

        attachContextMenu(card);

    } else {
        card = document.createElement('a');
        card.setAttribute('href', `/pokemon?id=${pokemon.id}`);
    }
    card.className = `pokemons-card ${isShiny ? 'shiny' : ''} ${pokemon.types[0]}`;
    card.style.order = pokemon.id;
    const PokeNumber = pokemon.id.toString().padStart(3, '0');
    const sprite = isShiny ?
        pokemon.sprites.animated_shiny || pokemon.sprites.animated || pokemon.sprites.icon_shiny :
        pokemon.sprites.animated || pokemon.sprites.icon;


    testImage(sprite).then(result => {
        if (result.ok) {
            card.setAttribute('data-icon', sprite);
        } else {
            card.setAttribute('data-icon', pokemon.sprites.icon);

        }
    });

    card.setAttribute('data-id', Number(pokemon.id));
    card.setAttribute('data-name', pokemon.name);
    card.setAttribute('data-ball', pokemon.sprites.ball_icon);

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
}
export function appendToPokedex(cardElement, destination) {
    if (!destination) return;
    destination.appendChild(cardElement);
}



export function initContextMenuEventsCards() {
    const contextMenu = document.getElementById("context-menu-pokemon");
    contextMenu.querySelector(".close-this").addEventListener("click", () => {
        contextMenu.style.display = "none";
    });


    contextMenu.querySelectorAll("[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            const card = contextMenu.currentCard;

            if (!action || !card) return;
            const icon = card.dataset.icon;
            const id = Number(card.dataset.id);
            const name = card.dataset.name;
            const ball = card.dataset.ball;

            switch (action) {
                case "profile":
                    window.location.href = `pokemon?id=${card.dataset.id}`;
                    break;
                case "add":
                    addPokemonTeam(icon, id, name, ball);
                    break;
                case "favorite":
                    card.classList.toggle("favorito");
                    break;
            }

            contextMenu.style.display = "none";
        });
    });
}

export function attachContextMenu(card) {
    card.addEventListener("click", e => {
        e.preventDefault();

        const contextMenu = document.getElementById("context-menu-pokemon");
        const menuWidth = 160;
        const menuHeight = 140;

        // Pega a posição do mouse no momento do clique
        let posX = e.clientX;
        let posY = e.clientY;

        // Ajusta se estiver muito perto da borda direita/inferior
        if (posX + menuWidth > window.innerWidth) {
            posX = window.innerWidth - menuWidth - 10;
        }

        if (posY + menuHeight > window.innerHeight) {
            posY = window.innerHeight - menuHeight - 10;
        }

        contextMenu.style.top = `${posY}px`;
        contextMenu.style.left = `${posX}px`;
        contextMenu.style.display = "block";

        contextMenu.currentCard = card;
    });
}
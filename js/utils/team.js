import { popupMessage } from "../dom.js";

export function loadStoredTeam() {
    const container = document.querySelector('.team-poke .content-list');
    const storedTeam = JSON.parse(localStorage.getItem('pokemonTeam')) || [];

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

        attachContextMenu(card);



    });
}

export function addPokemonTeam(icon, id, name, ball) {
    const container = document.querySelector('.team-poke .content-list');

    // Recupera o time atual do localStorage ou inicializa um array vazio
    const team = JSON.parse(localStorage.getItem('pokemonTeam')) || [];

    // Verifica se já tem 6
    if (team.length >= 6) {
        const title = 'Your team is complete \u{2714}\u{FE0F}';
        const message = 'You can only have 6 Pokemons in your team. </br> Remove a pokemon from your team and try again.';
        const type = 'success'
        popupMessage(title, message, type);
        return;
    }

    // Verifica se já existe esse pokémon no time
    if (team.find(p => p.id === id)) {
        const title = 'This Pokémon is already on your team';
        const message = "You can't " + name + " because it's already on your team.";
        const type = 'error'
        popupMessage(title, message, type);
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
    attachContextMenu(card)
}

export function deleteStoredTeam(poke) {
    let storedTeam = JSON.parse(localStorage.getItem('pokemonTeam')) || [];
    storedTeam = storedTeam.filter(item => item.id !== Number(poke));
    localStorage.setItem('pokemonTeam', JSON.stringify(storedTeam));
    console.table(storedTeam)
}

export function initContextMenuEvents() {
    const contextMenu = document.getElementById("context-menu");

    contextMenu.querySelector(".close-this").addEventListener("click", () => {
        contextMenu.style.display = "none";
    });

    contextMenu.querySelectorAll("[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            const card = contextMenu.currentCard;

            if (!action || !card) return;

            const pokeId = card.dataset.team;

            switch (action) {
                case "profile":
                    window.location.href = `pokemon?id=${pokeId}`;
                    break;
                case "remove":
                    card.remove();
                    deleteStoredTeam(pokeId);
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
        console.log("Click no card", card);

        const contextMenu = document.getElementById("context-menu");
        const rect = card.getBoundingClientRect();
        const menuWidth = 160;
        const menuHeight = 140;

        let posX = rect.left - menuWidth - 45;
        let posY = rect.top;

        if (posX < 0) posX = rect.right + 10;
        if (posY + menuHeight > window.innerHeight) {
            posY = window.innerHeight - menuHeight - 10;
        }

        contextMenu.style.top = `${posY}px`;
        contextMenu.style.left = `${posX}px`;
        contextMenu.style.display = "block";

        contextMenu.currentCard = card;
    });
}

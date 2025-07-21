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
}
export function appendToPokedex(cardElement, destination) {
    if (!destination) return;
    destination.appendChild(cardElement);
}
import {
    fetchPokemon
} from "../api.js";

export function initSearch() {
    // Adiciona o evento de busca
    const input = document.getElementById('search');
    const form = document.querySelector('.search-form');
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const value = e.target.value.trim();
            if (value) {
                searchPokemon(value);
            }
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = input.value;
        if (value) {
            searchPokemon(value);
        }
    });
}

export async function searchPokemon(name) {
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
}

export async function searchTeam() {
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
}
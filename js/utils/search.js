/*
 * Projeto: NenzaDex V2
 * Autor: Pedro Tomaz Rezende Fagundes
 * GitHub: https://github.com/pedrotomazdev
 *
 * ⚠️ Uso permitido APENAS com atribuição.
 * Proibido remover créditos ou redistribuir como se fosse autor original.
 */

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


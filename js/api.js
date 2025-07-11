export async function fetchPokemon(id) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) throw new Error('Pokémon não encontrado');
        const data = await res.json();

        // Verificação mínima para garantir dados essenciais
        if (!data.name || !data.id) {
            throw new Error('Dados incompletos do Pokémon');
        }

        return data;
    } catch (error) {
        console.warn(`Erro ao buscar Pokémon ${id}:`, error.message);
        return null;
    }
}

export async function fetchPokemonSpecies(url, id) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao buscar species para o Pokémon ${id}`);
        const data = await response.json();
        return data;
    } catch (err) {
        console.warn(`Erro em fetchPokemonSpecies(${id}):`, err.message);
        return null;
    }
}

export async function fetchPokemonList(limit, offset) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Falha ao buscar lista de pokémon');
    return res.json();
}

export async function getPokemonRegion(genId, limit, offset) {
    const res = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`);
    if (!res.ok) throw new Error('Falha ao buscar lista de pokémon');
    const data = await res.json();
    const allPokemons = data.pokemon_species;

    // Aplica limit e offset manualmente
    const sliced = allPokemons.slice(offset, offset + limit);

    return sliced; // ou retorna o objeto inteiro se quiser
}

export async function getRegionsList() {
    const res = await fetch(`https://pokeapi.co/api/v2/region`);
    if (!res.ok) throw new Error('Falha ao buscar lista de regiões');
    const data = await res.json();
    return data;
}

export async function getTypesList() {
    const res = await fetch(`https://pokeapi.co/api/v2/type`);
    if (!res.ok) throw new Error('Falha ao buscar lista de tipos');
    const data = await res.json();
    return data;
}


export async function getPokemonByTypes(typeId, limit, offset) {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${typeId}`);
    if (!res.ok) throw new Error('Falha ao buscar lista de pokémon');

    const data = await res.json();
    const allPokemons = data.pokemon;

    // Aplica limit e offset manualmente
    const sliced = allPokemons.slice(offset, offset + limit);

    return sliced; // ou retorna o objeto inteiro se quiser
}

export async function getEvolution(evolutionChainUrl) {
    try {
        const res = await fetch(evolutionChainUrl);
        const data = await res.json();


        const evolutions = [];

        // Função recursiva
        async function walk(chain, stage = 1) {
            const name = chain.species.name;
            const match = chain.species.url.match(/\/(\d+)\/?$/);
            const idMatch = match ? parseInt(match[1]) : null;


            let pokeRes

            if (idMatch) {
                pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${idMatch}`);

            } else {
                pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

            }

            const pokeData = await pokeRes.json();
            const id = pokeData.id;
            const types = pokeData.types;
            const stats = pokeData.stats;
            const abilities = pokeData.abilities;
            const sprites = pokeData.sprites;

            evolutions.push({
                name,
                id,
                sprites,
                stage,
                types,
                stats,
                abilities,
            });

            for (const next of chain.evolves_to) {
                await walk(next, stage + 1);
            }
        }

        await walk(data.chain);


        return evolutions;

    } catch (err) {
        console.warn("Erro ao buscar cadeia de evolução:", err);
        return [];
    }
}

export async function getForms(formsChain) {
    try {
        const forms = [];

        for (const info of formsChain) {
            if (info.is_default !== true) {
                const name = info.pokemon.name;
                const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
                const pokeData = await pokeRes.json();

                forms.push({
                    name,
                    id: pokeData.id,
                    sprites: pokeData.sprites,
                    types: pokeData.types,
                    stats: pokeData.stats,
                    abilities: pokeData.abilities,
                });
            }
        }

        return forms;

    } catch (err) {
        console.warn("Erro ao buscar cadeia de formas:", err);
        return [];
    }
}

// Aguardando API de tradução em tempo real
// const traducaoCache = new Map();
// export async function traduzirDescricao(texto) {
//     if (traducaoCache.has(texto)) return traducaoCache.get(texto);

//     try {
//         const res = await fetch('http://localhost:3000/traduzir', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 q: texto,
//                 source: 'en',
//                 target: 'pt',
//                 format: 'text'
//             })
//         });

//         const data = await res.json();
//         const traduzido = data.translatedText;
//         traducaoCache.set(texto, traduzido);
//         return traduzido;
//     } catch (e) {
//         console.warn('Erro ao traduzir, fallback para EN:', e);
//         return texto;
//     }
// }


export async function getTypeEffectiveness(types) {
    const typeDataList = await Promise.all(
        types.map(async type => {
            const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
            const data = await res.json();
            return data.damage_relations;
        })
    );

    const damageMap = {};

    typeDataList.forEach(rel => {
        rel.double_damage_from.forEach(t => {
            damageMap[t.name] = (damageMap[t.name] ?? 1) * 2;
        });
        rel.half_damage_from.forEach(t => {
            damageMap[t.name] = (damageMap[t.name] ?? 1) * 0.5;
        });
        rel.no_damage_from.forEach(t => {
            damageMap[t.name] = 0;
        });
    });

    const weaknesses = {};
    const resistant = {};
    const immunity = {};

    for (const [type, mult] of Object.entries(damageMap)) {
        if (mult === 0) {
            immunity[type] = true;
        } else if (mult > 1) {
            weaknesses[type] = mult;
        } else if (mult < 1) {
            resistant[type] = mult;
        }
    }

    return {
        weaknesses,
        resistant,
        immunity
    };
}

// export async function getFilteredPokemonGames() {
//     const nonMainlineGames = [
//         "green", "stadium", "stadium-2", "colosseum", "xd", "tcg", "snap",
//         "rumble", "ranger", "puzzle-challenge", "trozei", "battle-revolution",
//         "mystery-dungeon", "pokepark", "pokepark-2", "quest", "cafe", "masters",
//         "unite", "conquest", "home", "bank", "go", "sleep", "smile", "shuffle",
//         "red-japan", "blue-japan", "yellow-japan", "gold-japan", "silver-japan",
//         "crystal-japan", "ruby-japan", "sapphire-japan", "emerald-japan",
//         "firered-japan", "leafgreen-japan", "diamond-japan", "pearl-japan",
//         "platinum-japan", "heartgold-japan", "black-japan", "white-japan",
//         "black-2-japan", "white-2-japan","the-teal-mask","the-crown-tundra",
//         "the-isle-of-armor",
//     ];

//     function isMainlineVersion(name) {
//         return !nonMainlineGames.some(bad => name.includes(bad));
//     }

//     const res = await fetch('https://pokeapi.co/api/v2/version-group?limit=100');
//     const data = await res.json();

//     const versionGroups = await Promise.all(
//         data.results.map(async (group) => {
//             const resGroup = await fetch(group.url);
//             const groupData = await resGroup.json();

//             // Filtra apenas as versões principais do grupo
//             const mainVersions = groupData.versions.filter(v => isMainlineVersion(v.name));
//             const mainVersion = mainVersions[0]; // pega só o primeiro principal

//             if (!mainVersion) return null; // ignora grupos sem versões válidas

//             return {
//                 generation: groupData.generation.name,
//                 version: mainVersion.name,
//                 versionGroup: group.name,
//                 allMainVersions: mainVersions.map(v => v.name)
//             };
//         })
//     );

//     // Remove entradas nulas (grupos que foram pulados)
//     return versionGroups.filter(Boolean);
// }

<<<<<<< HEAD
import { fetchPokemonSpecies } from '../api.js';

export function getPokemonIcon(pokemon) {
    const generations = [
        'generation-viii',
        'generation-vii',
        'generation-vi',
        'generation-v',
        'generation-iv',
        'generation-iii',
        'generation-ii',
        'generation-i'
    ];

    for (const gen of generations) {
        const icon = pokemon.sprites?.versions?.[gen]?.icons?.front_default;
        if (icon) return icon;
    }

    const fallback = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokemon.id.toString().padStart(3, '0')}.png`;
    return pokemon.sprites?.other?.['official-artwork']?.front_default || fallback;
}

export function getPokemonArtwork(pokemon) {
    return (
        pokemon.sprites?.other?.['official-artwork']?.front_default ||
        `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokemon.id.toString().padStart(3, '0')}.png`
    );
}

export function getPokemonSprites(pokemon) {
    const sprites = pokemon.sprites;
    const validSprites = [];

    const possibleSprites = [
        sprites.other?.['official-artwork']?.front_default,
        sprites.front_default,
        sprites.front_shiny,
        sprites.back_default,
        sprites.back_shiny,
        sprites.other?.dream_world?.front_default,
        sprites.other?.home?.front_default
    ];

    possibleSprites.forEach(url => {
        if (url && !validSprites.includes(url)) validSprites.push(url);
    });

    return validSprites;

}

export function getPokemonTypes(pokemon) {
    return pokemon.types.map(t => t.type.name);
}

export function formatPokemonId(id) {
    return id.toString().padStart(3, '0');
}

export function getStats(pokemon) {
    const stats = {};
    pokemon.stats.forEach(stat => {
        const name = stat.stat.name; // ex: 'hp', 'attack', etc.
        stats[name] = stat.base_stat;
    });
    return stats;
}


export function parsePokemonDataCard(pokemon) {
    const id = formatPokemonId(pokemon.id);
    const idStr = String(pokemon.id);
    const order = pokemon.stage ? pokemon.stage : pokemon.id;
    const name = pokemon.name;
    const types = getPokemonTypes(pokemon);
    const type1 = types[0];
    const type2 = types[1] || 'none';
    const artwork = getPokemonArtwork(pokemon);
    const icon = getPokemonIcon(pokemon);



    return {
        id,
        order,
        name,
        types,
        type1,
        type2,
        artwork,
        icon,
    };
}

export function groupDataPokemon(pokemon, species) {

    const id = formatPokemonId(pokemon.id);
    const idStr = String(pokemon.id);
    const order = pokemon.stage ? pokemon.stage : pokemon.order;
    const name = pokemon.name;
    const types = getPokemonTypes(pokemon);
    const type1 = types[0];
    const type2 = types[1] || 'none';
    const artwork = getPokemonArtwork(pokemon);
    const icon = getPokemonIcon(pokemon);
    const stats = getStats(pokemon);
    const abilities = pokemon.abilities;
    const cry = `https://play.pokemonshowdown.com/audio/cries/${name.toLowerCase()}.mp3`;

    const category =
        species?.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown';

    return {
        id,
        idStr,
        order,
        name,
        types,
        type1,
        type2,
        artwork,
        icon,
        height: pokemon.height,
        weight: pokemon.weight,
        base_experience: pokemon.base_experience,
        stats,
        abilities,
        cry,
        category,
        raw: pokemon,
        species: species,
    };
}




=======
import { fetchPokemonSpecies } from '../api.js';

export function getPokemonIcon(pokemon) {
    const generations = [
        'generation-viii',
        'generation-vii',
        'generation-vi',
        'generation-v',
        'generation-iv',
        'generation-iii',
        'generation-ii',
        'generation-i'
    ];

    for (const gen of generations) {
        const icon = pokemon.sprites?.versions?.[gen]?.icons?.front_default;
        if (icon) return icon;
    }

    const fallback = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokemon.id.toString().padStart(3, '0')}.png`;
    return pokemon.sprites?.other?.['official-artwork']?.front_default || fallback;
}

export function getPokemonArtwork(pokemon) {
    return (
        pokemon.sprites?.other?.['official-artwork']?.front_default ||
        `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokemon.id.toString().padStart(3, '0')}.png`
    );
}

export function getPokemonSprites(pokemon) {
    const sprites = pokemon.sprites;
    const validSprites = [];

    const possibleSprites = [
        sprites.other?.['official-artwork']?.front_default,
        sprites.front_default,
        sprites.front_shiny,
        sprites.back_default,
        sprites.back_shiny,
        sprites.other?.dream_world?.front_default,
        sprites.other?.home?.front_default
    ];

    possibleSprites.forEach(url => {
        if (url && !validSprites.includes(url)) validSprites.push(url);
    });

    return validSprites;

}

export function getPokemonTypes(pokemon) {
    return pokemon.types.map(t => t.type.name);
}

export function formatPokemonId(id) {
    return id.toString().padStart(3, '0');
}

export function getStats(pokemon) {
    const stats = {};
    pokemon.stats.forEach(stat => {
        const name = stat.stat.name; // ex: 'hp', 'attack', etc.
        stats[name] = stat.base_stat;
    });
    return stats;
}


export function parsePokemonDataCard(pokemon) {
    const id = formatPokemonId(pokemon.id);
    const idStr = String(pokemon.id);
    const order = pokemon.stage ? pokemon.stage : pokemon.id;
    const name = pokemon.name;
    const types = getPokemonTypes(pokemon);
    const type1 = types[0];
    const type2 = types[1] || 'none';
    const artwork = getPokemonArtwork(pokemon);
    const icon = getPokemonIcon(pokemon);



    return {
        id,
        order,
        name,
        types,
        type1,
        type2,
        artwork,
        icon,
    };
}

export function groupDataPokemon(pokemon, species) {

    const id = formatPokemonId(pokemon.id);
    const idStr = String(pokemon.id);
    const order = pokemon.stage ? pokemon.stage : pokemon.order;
    const name = pokemon.name;
    const types = getPokemonTypes(pokemon);
    const type1 = types[0];
    const type2 = types[1] || 'none';
    const artwork = getPokemonArtwork(pokemon);
    const icon = getPokemonIcon(pokemon);
    const stats = getStats(pokemon);
    const abilities = pokemon.abilities;
    const cry = `https://play.pokemonshowdown.com/audio/cries/${name.toLowerCase()}.mp3`;

    const category =
        species?.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown';

    return {
        id,
        idStr,
        order,
        name,
        types,
        type1,
        type2,
        artwork,
        icon,
        height: pokemon.height,
        weight: pokemon.weight,
        base_experience: pokemon.base_experience,
        stats,
        abilities,
        cry,
        category,
        raw: pokemon,
        species: species,
    };
}




>>>>>>> 19bc759f0aa87b02512c83d52f7dcac3ebaeb348

import { globalFunctions } from "./dom.js";

async function includeHTML(selector, file) {
    const el = document.querySelector(selector);
    if (!el) return;
    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Erro ao carregar ${file}`);
        el.innerHTML = await res.text();
    } catch (err) {
        console.error(err);
        el.innerHTML = `<p>Erro ao carregar conteúdo.</p>`;
    }
}

// Inclui header e footer e depois inicializa scripts
(async function initSite() {
    await includeHTML('#include-header', '/partials/header.html');
    await includeHTML('#include-footer', '/partials/footer.html');

    globalFunctions.initThemeToggle();
    globalFunctions.initMenuToggle();

    globalFunctions.search.initSearch();1
    globalFunctions.initRandom();
    globalFunctions.loadStoredTeam();
    globalFunctions.loadFullPokedex();

    globalFunctions.initHeaderOnScroll();
    globalFunctions.initContextMenuEvents();

    window.scrollTo({ top: 0, behavior: 'smooth' });
})();




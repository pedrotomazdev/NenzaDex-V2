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

    initThemeToggle();
    initMenuToggle();
    globalFunctions.initSearch();
    globalFunctions.initRandom();
    initHeaderOnScroll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
})();

// ---- Funções separadas ----

function initThemeToggle() {
    const toggleBtn = document.getElementById('toggle-dark');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            document.documentElement.classList.toggle('dark-mode');

            const newTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
        });
    }
}

function initMenuToggle() {
    document.querySelectorAll('.item-menu.has-submenu').forEach(menuItem => {
        const button = menuItem.querySelector('.content-item-menu');
        const submenu = menuItem.querySelector('.sub-item');

        if (!button || !submenu) return;

        button.addEventListener('click', () => {
            const isOpen = submenu.classList.contains('active');

            document.querySelectorAll('.sub-item.active').forEach(el => {
                el.classList.remove('active');
                el.previousElementSibling?.setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                submenu.classList.add('active');
                button.setAttribute('aria-expanded', 'true');
                if (button.dataset.menu == 'search') {
                    document.getElementById('search').focus();
                }
            } else {
                submenu.classList.remove('active');
                button.setAttribute('aria-expanded', 'false');
            }
        });
    });

    document.addEventListener('click', e => {
        // Fecha submenus só se o clique foi fora de qualquer .item-menu
        if (!e.target.closest('.item-menu')) {
            document.querySelectorAll('.sub-item.active').forEach(el => {
                el.classList.remove('active');
                el.previousElementSibling?.setAttribute('aria-expanded', 'false');
            });
        }
    });
}

function initHeaderOnScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            header.classList.add('minimized');
        } else {
            header.classList.remove('minimized');
        }
    });
}

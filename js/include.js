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

// inclui header e footer automaticamente
includeHTML('#include-header', '/partials/header.html');
includeHTML('#include-footer', '/partials/footer.html');

const waitForToggleButton = setInterval(() => {
  const toggleBtn = document.getElementById('toggle-dark');
  if (toggleBtn) {
    // Aplica o tema salvo
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    }

    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      document.documentElement.classList.toggle('dark-mode');

      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });

    globalFunctions.initSearch();
    globalFunctions.initRandom();

    clearInterval(waitForToggleButton);
  }
}, 100);

// Aplica o tema salvo quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // ajusta o valor conforme o quanto quer descer
  }, 500);
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-mode');

  }
});




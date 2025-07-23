# 📘 NenzaDex V2

Uma Pokédex moderna, rápida, personalizável e cheia de recursos — feita do zero com JavaScript puro, consumo da PokéAPI e integração com dados externos.

🕹️ Acesse: [nenza-dex-v2.vercel.app](https://nenza-dex-v2.vercel.app/)

---

## 🧩 Funcionalidades

### 🔎 Pokédex Completa
- Scroll infinito com carregamento progressivo
- Filtros dinâmicos por:
  - Tipo
  - Habilidade
  - Habitat
  - Região
  - Cor
- Exibição de:
  - Formas regionais (Hisui, Alola, Galar, etc.)
  - Evoluções exclusivas por região
  - Categorias especiais (baby, starter, legendary, mythical, pseudo-legendary, ultra beast)

### 🎨 Imagens e Ícones
- Sprites animados de alta qualidade
- Fallback automático por geração
- Ícones personalizados de Pokébolas conforme a categoria do Pokémon

### 🧠 Lógica avançada de filtragem
- Interseção de múltiplos filtros (até 2 por categoria)
- Evita duplicatas, mesmo com múltiplas ocorrências em filtros

### 🧰 Times personalizados
- Criação de times salvos com `localStorage`
- Adição e remoção de Pokémon via clique
- Ícone da Pokébola reflete a função/categoria do Pokémon no time

### 💼 Currículo integrado (em construção)
- Página dedicada ao criador do projeto
- Design responsivo e exportável em PDF
- Link direto para download do currículo no layout da NenzaDex

---

## 🛠️ Tecnologias

- HTML5 + SCSS (com variáveis e mixins por região/tipo)
- JavaScript (modularizado, async/await, fetch API)
- Node.js (para consolidação da API full)
- PokéAPI + fontes externas para imagens e dados adicionais
- Deploy: [Vercel](https://vercel.com/)

---

## 📂 Organização do Projeto

/public # Ícones, sprites, assets visuais
/src
├── api.js # Funções de fetch e transformação de dados
├── dom.js # Manipulação do DOM, renderização
├── team.js # Lógica de time e localStorage
└── filters.js # Filtros dinâmicos e interseção
/data
└── full-nenzadex.json # Pokédex consolidada com dados estendidos

---

## 🤓 Sobre o projeto

Este projeto nasceu como um desafio pessoal: construir uma Pokédex completa, fluida e com uma estética própria — **sem frameworks**, apenas com código nativo, organização de módulos e APIs públicas.

Foram aproximadamente **35 horas de trabalho contínuo**, entre:

- Coleta e tratamento de dados da PokéAPI
- Construção da lógica de filtros e scroll
- Customização visual e responsiva
- Otimizações de performance
- Organização e modularização do código

---

## 📬 Contato

Caso queira saber mais sobre o projeto ou entrar em contato para oportunidades:

- LinkedIn: [https://www.linkedin.com/in/pedro-tomaz/](#)
- GitHub: [@pedrotomazdev ](#)
- E-mail: pedrotomazdev@gmail.com

---

## 📜 Licença

Este projeto é livre para uso e modificação.  
Sinta-se à vontade para estudar, remixar ou contribuir! 🧪
// ==========================================
// CONFIG
// ==========================================
const API_URL = 'https://vj.interfaces.jima.com.ar/api/v2';
const MockApi = 'https://6abc0804b2118ed7abb990b5.mockapi.io/Juegos';
const MIN_GAMES = 3; // NUEVO: si hay menos de 3, se completa con MockAPI


// Traduce los géneros de MockAPI (español) a los data-category del HTML
const GENRE_MAP = {           // NUEVO
  deportes: 'sports',
  estrategia: 'strategy'
};

// Esta API no filtra por categoría en el servidor: siempre devuelve
// todo el catálogo. Por eso lo traemos UNA sola vez y filtramos acá.
let allGames = [];
let mockGames = null;

// ==========================================
// CARGA INICIAL
// ==========================================
async function init() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    allGames = await response.json();

     // CAMBIO: esperamos a que todas las secciones terminen
    const sections = Array.from(document.querySelectorAll('.game-section'));
    await Promise.all(sections.map(renderSection));
  } catch (err) {
    console.error('Error cargando el catálogo:', err);
    document.querySelectorAll('.game-row').forEach(row => {
      row.innerHTML = `<p>No se pudo cargar el catálogo. Intentá de nuevo más tarde.</p>`;
    });
  }
}
// ==========================================
// RENDERIZA UNA SECCIÓN SEGÚN SU data-category
// ==========================================
function renderSection(section) {
  

  const category = section.dataset.category; // ej: "shooter", "rpg", "action"
  const row = section.querySelector('.game-row');
  if (!row) return;

  const filtered = category
    ? allGames.filter(game =>
        game.genres.some(g => g.name.toLowerCase() === category.toLowerCase())
      )
    : allGames; // sin data-category => muestra todos

  renderCards(row, filtered.slice(0, 20)); // límite por fila, ajustable
}

// ==========================================
// CREA LAS TARJETAS DENTRO DE UN .game-row
// ==========================================
function renderCards(row, games) {
  row.innerHTML = '';

  if (games.length === 0) {
    row.innerHTML = `<p>No hay juegos en esta categoría todavía.</p>`;
    return;
  }

  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.background_image}" alt="${game.name}"
           loading="lazy"
           onerror="this.src='../Img/game-placeholder.png'">
      <div class ="game-title">${game.name}</div>
    `;
    row.appendChild(card);
  });
}

// ==========================================
// ARRANCA TODO CUANDO EL DOM ESTÁ LISTO
// ==========================================
document.addEventListener('DOMContentLoaded', init);
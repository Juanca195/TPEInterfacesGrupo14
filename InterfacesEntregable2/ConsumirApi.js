
// ==========================================
// CONFIG
// ==========================================
const API_URL = 'https://vj.interfaces.jima.com.ar/api/v2';
const MOCK_API_URL = 'https://6abc0804b2118ed7abb990b5.mockapi.io/Juegos'; // NUEVO
const MIN_GAMES = 3; // NUEVO: si hay menos de 3, se completa con MockAPI

// Traduce los géneros de MockAPI (español) a los data-category del HTML
const GENRE_MAP = {           // NUEVO
  deportes: 'sports',
  estrategia: 'strategy'
};

let allGames = [];
let mockGames = null; // NUEVO: caché, se llena solo si hace falta

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
// NUEVO: TRAE Y NORMALIZA LOS JUEGOS DE MOCKAPI
// ==========================================
async function loadMockGames() {
  if (mockGames) return mockGames; // ya los pedimos antes

  try {
    const response = await fetch(MOCK_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // Los convertimos al mismo formato que la API principal
    mockGames = data.map(game => {
      const genero = String(game.Genero || '').toLowerCase();
      return {
        name: game.Name,
        background_image: game['Background-image'],
        genres: [{ name: GENRE_MAP[genero] || genero }]
      };
    });
  } catch (err) {
    console.error('Error cargando MockAPI:', err);
    mockGames = []; // si falla, seguimos con lo que haya
  }

  return mockGames;
}

// ==========================================
// RENDERIZA UNA SECCIÓN SEGÚN SU data-category
// ==========================================
async function renderSection(section) { // CAMBIO: ahora es async
  const category = section.dataset.category;
  const row = section.querySelector('.game-row');
  if (!row) return;

  let filtered = category
    ? allGames.filter(game =>
        game.genres.some(g => g.name.toLowerCase() === category.toLowerCase())
      )
    : allGames;

  // NUEVO: si hay pocos juegos, completamos con MockAPI
  if (category && filtered.length < MIN_GAMES) {
    const mock = await loadMockGames();
    const extra = mock.filter(game =>
      game.genres.some(g => g.name === category.toLowerCase())
    );

    // Evitamos duplicados por nombre
    const existing = new Set(filtered.map(g => g.name.toLowerCase()));
    const newOnes = extra.filter(g => !existing.has(g.name.toLowerCase()));

    filtered = filtered.concat(newOnes);
  }

  renderCards(row, filtered.slice(0, 20));
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

    const img = document.createElement('img');
    img.src = game.background_image;
    img.alt = game.name;
    img.loading = 'lazy';
    img.onerror = () => { img.src = '../Img/game-placeholder.png'; };

    const title = document.createElement('div');
    title.className = 'game-title';
    title.textContent = game.name;

    card.append(img, title);
    row.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', init);
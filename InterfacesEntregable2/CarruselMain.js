// ==========================================
// CARRUSEL: flechas que deslizan cada .game-row
// ==========================================
function initCarousel(carousel) {
  // Elementos de este carrusel
  const viewport = carousel.querySelector('.game-viewport');
  const row = carousel.querySelector('.game-row');
  const prevButton = carousel.querySelector('.row-arrow.prev');
  const nextButton = carousel.querySelector('.row-arrow.next');

  // Número de la primera tarjeta que se ve (0 = la primera de todas)
  let firstCard = 0;

  // Todas las tarjetas de la fila
  function getCards() {
    return row.querySelectorAll('.game-card');
  }

  // Lo que hay que mover para pasar de una tarjeta a la siguiente:
  // el ancho de una tarjeta + el espacio entre tarjetas
  function getStep() {
    const card = row.querySelector('.game-card');
    if (!card) return 0;   // todavía no llegaron las tarjetas de la API
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    return card.offsetWidth + gap;
  }

  // Cuántas tarjetas entran completas en pantalla
  function getCardsPerPage() {
    const step = getStep();
    if (step === 0) return 1;
    return Math.max(1, Math.floor(viewport.clientWidth / step));
  }

  // El número más alto que puede tener "firstCard" (la última página)
  function getLastFirstCard() {
    return Math.max(0, getCards().length - getCardsPerPage());
  }

  // Muestra las tarjetas a partir de la número "index"
  function showCard(index) {
    // que no se pase del principio ni del final
    firstCard = Math.max(0, Math.min(index, getLastFirstCard()));

    // pasamos de "número de tarjeta" a píxeles, sin pasar del largo de la fila
    const maxOffset = Math.max(0, row.offsetWidth - viewport.clientWidth);
    const offset = Math.min(firstCard * getStep(), maxOffset);
    row.style.setProperty('--x', offset + 'px');   // el CSS mueve la fila con esta variable

    // flechas activas o desactivadas
    prevButton.disabled = firstCard === 0;
    nextButton.disabled = firstCard === getLastFirstCard();
  }

  // Animación: cada tarjeta visible espera un poco más que la anterior
  function playAnimation() {
    const cardsPerPage = getCardsPerPage();

    getCards().forEach((card, index) => {
      const position = index - firstCard;   // 0 = primera tarjeta visible
      const isVisible = position >= 0 && position < cardsPerPage;
      card.style.setProperty('--n', isVisible ? position : 0);   // el CSS usa --n como retraso
    });

    // Para repetir la animación: sacar la clase, forzar al navegador y volver a ponerla
    row.classList.remove('is-moving');
    void row.offsetWidth;
    row.classList.add('is-moving');
  }

  // Avanza (direction = 1) o retrocede (direction = -1) una página de tarjetas
  function move(direction) {
    const oldFirstCard = firstCard;

    showCard(firstCard + direction * getCardsPerPage());

    // solo animamos si realmente se movió
    if (firstCard !== oldFirstCard) {
      playAnimation();
    }
  }

  // Clics de las flechas
  prevButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));

  // Recalcula cuando cambia el tamaño de la ventana o cuando llegan las tarjetas de la API
  const observer = new ResizeObserver(() => showCard(firstCard));
  observer.observe(viewport);
  observer.observe(row);

  showCard(0);
}

document.addEventListener('DOMContentLoaded', () => {
  init();   // tu función que pide los juegos a la API y crea las tarjetas
  document.querySelectorAll('.game-carousel').forEach(initCarousel);
});
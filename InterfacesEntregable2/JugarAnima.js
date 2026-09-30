const btn = document.getElementById('btnJugar');
let navegando = false;

// Saltito periódico: solo alterna una clase, el movimiento lo hace la transition
const salto = setInterval(() => {
  if (navegando || btn.matches(':hover')) return;
  btn.classList.add('salto');
  setTimeout(() => btn.classList.remove('salto'), 250);
}, 2500);

// Al tocar: se desvanece y navega
btn.addEventListener('click', () => {
  if (navegando) return;
  navegando = true;
  clearInterval(salto);
  btn.classList.add('saliendo');
  setTimeout(() => {
    window.location.href = 'Juego.html';
  }, 350);
});
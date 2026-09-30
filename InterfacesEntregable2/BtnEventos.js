document.addEventListener('DOMContentLoaded', function () {
 
  // Seleccionamos el botón y el menú
  const btnPerfil = document.querySelector('.btn-perfil');
  const menuPerfil = document.querySelector('.menu-perfil');

  // Evento para abrir/cerrar el menú al hacer clic en el botón
  btnPerfil.addEventListener('click', function(evento) {
    // toggle() agrega la clase 'activo' si no la tiene, y la quita si ya la tiene
    menuPerfil.classList.toggle('activo');
    
    // Esto evita que el clic en el botón active el evento de "cerrar haciendo clic afuera"
    evento.stopPropagation(); 
  });

  // Evento para cerrar el menú si se hace clic en cualquier otra parte de la pantalla
  document.addEventListener('click', function(evento) {
    if (menuPerfil && btnPerfil){
    // Si el menú está activo Y el clic no fue dentro del menú ni en el botón
    if (!menuPerfil.contains(evento.target) && !btnPerfil.contains(evento.target)) {
      menuPerfil.classList.remove('activo');
     }
    }
  });
  

  const burgerBtn = document.querySelector('.btn-burger');
  const menu = document.querySelector('.menu-hamburguesa');
  const menuItems = document.querySelectorAll('.menu-item');

  
  if (!burgerBtn || !menu) return;

  // Crea el overlay dinámicamente (no hace falta tocar el HTML)
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);

  // ---------- Abrir / cerrar menú ----------
  function toggleMenu() {
    burgerBtn.classList.toggle('active');
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
  }

  burgerBtn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  // ---------- Marcar la opción activa al clickear y navegar ----------
  menuItems.forEach(function (item) {
    item.addEventListener('click', function () {
      menuItems.forEach(function (i) { i.classList.remove('active'); });
      item.classList.add('active');

      // Cierra el menú luego de navegar
      if (menu.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // ---------- Marcar automáticamente la sección visible al scrollear ----------
  const sections = document.querySelectorAll('section[id]');

  if (sections.length) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          menuItems.forEach(function (item) {
            item.classList.toggle('active', item.dataset.section === id);
          });
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }


  
});

//btn-banner-jugar
const btn_banner_jugar = document.getElementById('btnJugar');
let navegando = false;

// Saltito periódico: solo alterna una clase, el movimiento lo hace la transition
const salto = setInterval(() => {
  if (navegando || btn_banner_jugar.matches(':hover')) return;
  btn_banner_jugar.classList.add('salto');
  setTimeout(() => btn_banner_jugar.classList.remove('salto'), 250);
}, 2500);

// Al tocar: se desvanece y navega
btn_banner_jugar.addEventListener('click', () => {
  if (navegando) return;
  navegando = true;
  clearInterval(salto);
  btn_banner_jugar.classList.add('saliendo');
  setTimeout(() => {
    window.location.href = 'Juego.html';
  }, 350);
});

//flechas

const track = document.querySelector('.banner-track');
const prev = document.querySelector('.banner-arrow.prev');
const next = document.querySelector('.banner-arrow.next');

next.addEventListener('click', () => {
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    track.scrollTo({
        left: atEnd ? 0 : track.scrollLeft + track.clientWidth,
        behavior: 'smooth'
    });
});

prev.addEventListener('click', () => {
    const atStart = track.scrollLeft <= 0;
    track.scrollTo({
        left: atStart ? track.scrollWidth : track.scrollLeft - track.clientWidth,
        behavior: 'smooth'
    });
});

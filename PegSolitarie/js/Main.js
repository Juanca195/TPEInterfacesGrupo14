import { Tablero } from "../model/Tablero.js";
import { Ficha } from "../model/Ficha.js";
import { Temporizador } from "../model/Temporizador.js";
import { VistaTablero } from "../view/VistaTablero.js";
import { VistaMenu } from "../view/VistaMenu.js";
import { VistaTemporizador } from "../view/VistaTemporizador.js";
import { Juego } from "../controller/JuegoController.js";

// ===================================================
// 1. Referencias a elementos del HTML
// ===================================================
const elementoCanvas = document.getElementById("canvas");
const elementoContenedorMenu = document.getElementById("contenedorMenu");
const elementoTemporizador = document.getElementById("temporizador");


// 2. Definir las fichas disponibles (temática DBZ)
// Cada una es una instancia de Ficha, con nombre + ruta de imagen

const fichaDragon = new Ficha("Dragon", new URL("../assets/ficha_dragon.png", import.meta.url).href);
const fichaEsfera = new Ficha("Esfera",new URL("../assets/ficha_esfera.png", import.meta.url).href);

const listaDeFichasDisponibles = [fichaDragon, fichaEsfera];

// ===================================================
// 3. Imagen de fondo del tablero vacío
// ===================================================
const imagenFondoTablero = new Image();
imagenFondoTablero.src = new URL("../assets/fondoPeg.jpg", import.meta.url).href;

// ===================================================
// 4. Configuración de tamaño y tiempo
// ===================================================
const ANCHO_CELDA = 70;
const ALTO_CELDA = 74;
const DURACION_DEL_JUEGO_EN_SEGUNDOS = 300; // 5 minutos, por ejemplo

// ===================================================
// 5. Instanciar el Model
// ===================================================
const tablero = new Tablero();
const temporizador = new Temporizador(DURACION_DEL_JUEGO_EN_SEGUNDOS);

// ===================================================
// 6. Instanciar la View
// ===================================================
const vistaTablero = new VistaTablero(elementoCanvas, ANCHO_CELDA, ALTO_CELDA, imagenFondoTablero);
const vistaMenu = new VistaMenu(elementoContenedorMenu, listaDeFichasDisponibles);
const vistaTemporizador = new VistaTemporizador(elementoTemporizador);

// ===================================================
// 7. Instanciar el Controller, pasándole el Model y la View
// ===================================================
const juego = new Juego(tablero, vistaTablero, vistaMenu, vistaTemporizador, temporizador);

// ===================================================
// 8. Conectar los callbacks del Temporizador con el Controller
// (el Model avisa, el Controller decide qué hacer)
// ===================================================
temporizador.alActualizar = function (segundosRestantes) {
  vistaTemporizador.actualizar(segundosRestantes);
};

temporizador.alFinalizarTiempo = function () {
  juego.alAgotarseElTiempo();
};

// ===================================================
// 9. Conectar los eventos del mouse sobre el canvas
// con los métodos del Controller (drag and drop)
// ===================================================
elementoCanvas.addEventListener("mousedown", function (eventoMouse) {
  const posicionDelCanvas = elementoCanvas.getBoundingClientRect();
  const posicionXClic = eventoMouse.clientX - posicionDelCanvas.left;
  const posicionYClic = eventoMouse.clientY - posicionDelCanvas.top;

  juego.manejarMouseDown(posicionXClic, posicionYClic);
});

elementoCanvas.addEventListener("mousemove", function (eventoMouse) {
  const posicionDelCanvas = elementoCanvas.getBoundingClientRect();
  const posicionXActualMouse = eventoMouse.clientX - posicionDelCanvas.left;
  const posicionYActualMouse = eventoMouse.clientY - posicionDelCanvas.top;

  juego.manejarMouseMove(posicionXActualMouse, posicionYActualMouse);
});

elementoCanvas.addEventListener("mouseup", function (eventoMouse) {
  const posicionDelCanvas = elementoCanvas.getBoundingClientRect();
  const posicionXSoltar = eventoMouse.clientX - posicionDelCanvas.left;
  const posicionYSoltar = eventoMouse.clientY - posicionDelCanvas.top;

  juego.manejarMouseUp(posicionXSoltar, posicionYSoltar);
});

// ===================================================
// 10. Conectar el botón de reiniciar partida
// ===================================================
const botonReiniciar = document.getElementById("botonReiniciar");
botonReiniciar.addEventListener("click", function () {
  juego.reiniciarPartida();
});

// ===================================================
// 11. Arrancar el juego (muestra el menú de selección de ficha)
// ===================================================
juego.iniciar();






//Codigo de prueba para ver como se ve
// const canvas = document.getElementById("canvas");
//
// if (!canvas) {
//   throw new Error("No se encontró el canvas.");
// }
//
// const tablero = new Tablero();
// tablero.inicializar();
//
// const fichaDragon = new Ficha(
//   "Dragón",
//   new URL("../assets/ficha_dragon.png", import.meta.url).href
// );
//
// const imagenFondo = new Image();
// const rutaFondo = new URL("../assets/fondoPeg.jpg", import.meta.url).href;
//
// const fondoCargado = new Promise((resolve, reject) => {
//   imagenFondo.onload = resolve;
//   imagenFondo.onerror = () => {
//     reject(new Error(`No se pudo cargar el fondo: ${rutaFondo}`));
//   };
//   imagenFondo.src = rutaFondo;
// });
//
// async function mostrarTablero() {
//   await Promise.all([
//     fichaDragon.cargarImagen(),
//     fondoCargado,
//   ]);
//
//   const vistaTablero = new VistaTablero(
//     canvas,
//     70,
//     74,
//     imagenFondo
//   );
//
//   vistaTablero.dibujarTableroCompleto(
//     tablero,
//     fichaDragon,
//     null,
//     null
//   );
// }
//
// mostrarTablero().catch((error) => {
//   console.error("No se pudo mostrar el tablero:", error);
// });

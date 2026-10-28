import { Tablero } from "./Tablero.js";
import { Ficha } from "./Ficha.js";
import { Temporizador } from "./Temporizador.js";
import { VistaTablero } from "./VistaTablero.js";
import { VistaMenu } from "./VistaMenu.js";
import { VistaTemporizador } from "./VistaTemporizador.js";
import { Juego } from "./Juego.js";

// ===================================================
// 1. Referencias a elementos del HTML
// ===================================================
const elementoCanvas = document.getElementById("canvas");
const elementoContenedorMenu = document.getElementById("contenedorMenu");
const elementoTemporizador = document.getElementById("temporizador");

// ===================================================
// 2. Definir las fichas disponibles (temática DBZ)
// Cada una es una instancia de Ficha, con nombre + ruta de imagen
// ===================================================
const fichaGoku = new Ficha("Goku", "../InterfacesEntregable2/Img/ficha-goku.png");
const fichaVegeta = new Ficha("Vegeta", "../InterfacesEntregable2/Img/ficha-vegeta.png");
const fichaBulma = new Ficha("Bulma", "../InterfacesEntregable2/Img/ficha-bulma.png");
const fichaDragonBall = new Ficha("Dragon Ball", "../InterfacesEntregable2/Img/ficha-dragonball.png");

const listaDeFichasDisponibles = [fichaGoku, fichaVegeta, fichaBulma, fichaDragonBall];

// ===================================================
// 3. Imagen de fondo del tablero vacío
// ===================================================
const imagenFondoTablero = new Image();
imagenFondoTablero.src = "../InterfacesEntregable2/Img/fondo-tablero-dbz.png";

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
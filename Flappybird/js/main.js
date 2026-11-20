import { Juego } from "./juego/Juego.js";
import { Vista } from "./vista/Vista.js";
import { Controlador } from "./control/Controlador.js";
import { Interfaz } from "./ui/Interfaz.js";

// Tamaño lógico del juego: antes lo daba el atributo width/height del Canvas.
const ANCHO_JUEGO = 900;
const ALTO_JUEGO = 600;

// Busca un elemento necesario y falla explícitamente si el HTML no lo contiene.
function obtenerElemento(selector) {
  const elemento = document.querySelector(selector);
// ...(la función obtenerElemento queda igual)...

if (!elemento) {
    throw new Error(`No se encontró el elemento requerido: ${selector}`);
  }

  return elemento;
}

const escenario = obtenerElemento("#escenario");
escenario.style.width = `${ANCHO_JUEGO}px`;
escenario.style.height = `${ALTO_JUEGO}px`;

const juego = new Juego(ANCHO_JUEGO, ALTO_JUEGO);
const vista = new Vista(escenario);
const interfaz = new Interfaz(
  obtenerElemento("#marcador"),
  obtenerElemento("#pantalla-mensaje"),
  obtenerElemento("#titulo-mensaje"),
  obtenerElemento("#texto-mensaje"),
  obtenerElemento("#boton-inicio"),
  obtenerElemento("#vidas")
);
const controlador = new Controlador(
  juego,
  vista,
  interfaz,
  escenario,   // antes: canvas
  obtenerElemento("#jugador")
);

controlador.iniciar();

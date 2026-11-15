import { Juego } from "./juego/Juego.js";
import { Renderizador } from "./render/Renderizador.js";
import { Controlador } from "./control/Controlador.js";
import { Interfaz } from "./ui/Interfaz.js";

// Busca un elemento necesario y falla explícitamente si el HTML no lo contiene.
function obtenerElemento(selector) {
  const elemento = document.querySelector(selector);

  if (!elemento) {
    throw new Error(`No se encontró el elemento requerido: ${selector}`);
  }

  return elemento;
}

// Reúne las dependencias del juego y las conecta sin implementar su lógica.
const canvas = obtenerElemento("#lienzo-juego");
const juego = new Juego(canvas.width, canvas.height);
const renderizador = new Renderizador(canvas);
const interfaz = new Interfaz(
  obtenerElemento("#marcador"),
  obtenerElemento("#pantalla-mensaje"),
  obtenerElemento("#titulo-mensaje"),
  obtenerElemento("#texto-mensaje"),
  obtenerElemento("#boton-inicio")
);
const controlador = new Controlador(
  juego,
  renderizador,
  interfaz,
  canvas
);

// Inicia el controlador, que conecta los eventos y dibuja la pantalla inicial.
controlador.iniciar();

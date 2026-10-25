export class VistaMenu {
  constructor(contenedorHTML, listaDeFichasDisponibles) {
    this.contenedorHTML = contenedorHTML;
    this.listaDeFichasDisponibles = listaDeFichasDisponibles; // varios tipos de ficha (req. 9)
  }

  mostrarSelectorDeFicha(alElegirFicha) {
    // Renderiza las opciones de ficha disponibles (ej: Goku, Vegeta, Bulma)
    // y ejecuta el callback alElegirFicha cuando el jugador clickea una
  }

  mostrarInstrucciones() {
    // Muestra el texto de "cómo jugar" + imágenes descriptivas (req. 8)
  }

  ocultar() {
    // Esconde el menú para mostrar el tablero
  }
}


// ===================================================
// VIEW: VistaTemporizador
// Muestra el tiempo restante en pantalla
// ===================================================
export class VistaTemporizador {
  constructor(elementoHTML) {
    this.elementoHTML = elementoHTML;
  }

  actualizar(segundosRestantes) {
    // Formatea y muestra el tiempo (ej: "02:45")
  }
}
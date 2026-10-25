// ===================================================
// CONTROLLER: Juego
// Orquesta todo: selección de ficha, drag and drop,
// validación de movimientos, timer, fin del juego.
// ===================================================
export class Juego {
  constructor(tablero, vistaTablero, vistaMenu, vistaTemporizador, temporizador) {
    this.tablero = tablero;
    this.vistaTablero = vistaTablero;
    this.vistaMenu = vistaMenu;
    this.vistaTemporizador = vistaTemporizador;
    this.temporizador = temporizador;

    this.fichaElegida = null;
    this.estadoDelJuego = "SELECCIONANDO_FICHA"; // "EN_PARTIDA", "FINALIZADO"

    // Estado del drag and drop (req. 3 y 6)
    this.pozoEnArrastre = null;       // { fila, columna } del pozo que se está moviendo
    this.estaArrastrando = false;
    this.posicionActualMouseX = 0;
    this.posicionActualMouseY = 0;
    this.movimientosPosiblesActuales = []; // para dibujar los hints
  }

  iniciar() {
    // Muestra el menú de selección de ficha e instrucciones
  }

  elegirFicha(ficha) {
    // Guarda la ficha, la carga, oculta el menú,
    // inicializa el tablero, arranca el temporizador,
    // cambia el estado a "EN_PARTIDA"
  }

  manejarMouseDown(posXClic, posYClic) {
    // Si el estado no es "EN_PARTIDA", ignora
    // Convierte el clic a fila/columna
    // Si ese pozo tiene ficha: marca pozoEnArrastre, estaArrastrando = true,
    //   y calcula movimientosPosiblesActuales con tablero.obtenerMovimientosPosiblesDesde()
    //   para mostrar los hints animados
  }

  manejarMouseMove(posXActualMouse, posYActualMouse) {
    // Si estaArrastrando es true, actualiza
    // posicionActualMouseX/Y y vuelve a dibujar todo
    // (tablero + hints + la ficha siguiendo al mouse)
  }

  manejarMouseUp(posXSoltar, posYSoltar) {
    // Si estaArrastrando es true:
    //   convierte la posición de suelta a fila/columna
    //   si tablero.esMovimientoValido(...) es true:
    //     ejecuta tablero.moverFicha(...)
    //   si no es válido: no pasa nada, la ficha "vuelve" a su lugar
    //     (simplemente se redibuja el tablero sin aplicar el cambio)
    //   limpia pozoEnArrastre, estaArrastrando, movimientosPosiblesActuales
    //   redibuja
    //   llama a verificarFinDeJuego() (req. 5: se chequea después de cada movimiento)
  }

  verificarFinDeJuego() {
    // Consulta tablero.obtenerEstadoDelJuego()
    // Si no es "EN_JUEGO": detiene el temporizador,
    //   cambia estadoDelJuego a "FINALIZADO",
    //   muestra el mensaje correspondiente
  }

  alAgotarseElTiempo() {
    // Callback que le pasamos al Temporizador:
    // termina el juego por tiempo agotado, sin importar
    // si había movimientos disponibles o no
  }

  reiniciarPartida() {
    // Detiene el temporizador, lo reinicia,
    // vuelve estadoDelJuego a "SELECCIONANDO_FICHA",
    // limpia toda la selección/arrastre,
    // muestra de nuevo el menú de selección de ficha
  }

  bucleDeAnimacion(timestamp) {
    // Usado con requestAnimationFrame para animar los hints
    // (las flechas moviéndose/parpadeando) mientras hay
    // movimientosPosiblesActuales visibles.
    // Se vuelve a llamar a sí mismo con requestAnimationFrame
    // mientras estaArrastrando sea true
  }
}
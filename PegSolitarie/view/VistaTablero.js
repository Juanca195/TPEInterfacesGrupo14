export class VistaTablero {
  constructor(canvas, anchoCelda, altoCelda, imagenFondo) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.anchoCelda = anchoCelda;
    this.altoCelda = altoCelda;
    this.imagenFondo = imagenFondo; // imagen de fondo del tablero vacío (req. 1)
  }

  dibujarFondo() {
    // Dibuja la imagen de fondo del tablero (tablero vacío)
  }

  dibujarTableroCompleto(tablero, fichaElegida, pozoEnArrastre) {
    // Dibuja el fondo primero, luego recorre la matriz
    // y dibuja una ficha (con imagen, no color) en cada pozo ocupado,
    // salvo en el pozo que se está arrastrando actualmente (si corresponde)
  }

  dibujarFicha(imagen, posX, posY) {
    // Path2D + clip + drawImage, como ya armamos
  }

  dibujarFichaSiguiendoElMouse(imagen, posXMouse, posYMouse) {
    // Mientras el jugador arrastra, dibuja la ficha centrada
    // en la posición actual del mouse (encima de todo lo demás)
  }

  dibujarHintsAnimados(listaDeMovimientosPosibles, timestampAnimacion) {
    // req. 3: por cada movimiento posible, dibuja una flecha o indicador
    // animado sobre el pozo destino. El timestamp se usa para animar
    // (por ejemplo, haciendo que la flecha "rebote" con un seno/coseno
    // en función del tiempo transcurrido)
  }

  convertirPosicionAFilaColumna(posX, posY) {
    // Traduce coordenadas de pantalla a fila/columna del tablero
  }

  convertirFilaColumnaAPosicion(fila, columna) {
    // Traduce fila/columna a coordenadas X/Y del canvas
    // (lo inverso del método anterior, útil para dibujar)
  }

  mostrarMensajeFinDeJuego(estadoDelJuego) {
    // Muestra el resultado final (ganó / perdió / se acabó el tiempo)
  }
}

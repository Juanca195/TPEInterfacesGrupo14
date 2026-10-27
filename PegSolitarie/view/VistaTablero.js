export class VistaTablero {
  constructor(canvas, anchoCelda, altoCelda, imagenFondo) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.anchoCelda = anchoCelda;
    this.altoCelda = altoCelda;
    this.imagenFondo = imagenFondo; // imagen de fondo del tablero vacío (req. 1)
  }

  // calcular el ancho y alto? o ya viene en anchoCelda y altoCelda?
  dibujarFondo() {
    // Dibuja la imagen de fondo del tablero (tablero vacío)
    this.ctx.clearRect(0, 0, this.canvas.anchoCelda, this.altoCelda);

    this.ctx.drawImage(
      this.imagenFondo, 0, 0, this.canvas.anchoCelda, this.canvas.altoCelda
    );
  }

  dibujarTableroCompleto(tablero, fichaElegida, pozoEnArrastre) {
  //     Dibujar el fondo del tablero.
      this.dibujarFondo();
  // Recorrer la matriz y dibujar una ficha en cada pozo ocupado.
      for(let fila = 0; fila < tablero.matriz.length; fila++){
        for(let columna = 0; columna< tablero.matriz[fila].length; columna++){
          if(tablero.matriz[fila][columna] !==1);

          const esPozoArrastrado = pozoEnArrastre && pozoEnArrastre.fila === fila
          && pozoEnArrastre.columna === columna;

          if(esPozoArrastrado) continue;
          const {x, y} = this.convertirFilaColumnaAPosicion(fila, columna);
          this.dibujarFicha(fichaElegida.imagenCargada, x, y);
        }
      }
  // Si se está arrastrando una ficha, no dibujarla en su pozo de origen.
    if(pozoEnArrastre){
    // Dibujar la ficha arrastrada en la posición actual del mouse, encima de todo.
      this.dibujarFichaSiguiendoElMouse(
        fichaElegida.imagenCargada, 
        pozoEnArrastre.x,
        pozoEnArrastre.y
      );
    }
    // falta terminar
  // Dibujar los indicadores de movimientos posibles.
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

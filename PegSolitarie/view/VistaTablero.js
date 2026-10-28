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
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.drawImage(
      this.imagenFondo, 0, 0, this.canvas.width, this.canvas.height
    );
  }
 // posicionMouse, debe traer las cordenadas actuales del cursor
  dibujarTableroCompleto(tablero, fichaElegida, pozoEnArrastre, posicionMouse, movimientosPosibles = [], timestampAnimacion) {
  //     Dibujar el fondo del tablero.
      this.dibujarFondo();
  // Recorrer la matriz y dibujar una ficha en cada pozo ocupado.
      for(let fila = 0; fila < tablero.matriz.length; fila++){
        for(let columna = 0; columna< tablero.matriz[fila].length; columna++){
          //dibujar solo los poszos ocupados 
          if(tablero.matriz[fila][columna] !==1){
            continue;
          }

          const esPozoArrastrado = pozoEnArrastre && pozoEnArrastre.fila === fila
          && pozoEnArrastre.columna === columna;

          if(esPozoArrastrado) continue;
          const {x, y} = this.convertirFilaColumnaAPosicion(fila, columna);
          this.dibujarFicha(fichaElegida.imagenCargada, x, y);
        }
      }

      //los indicadores se dibujan encima del tablero.
      if(movimientosPosibles.length > 0){
        this.dibujarHintsAnimados(movimientosPosibles, timestampAnimacion);
      }
  // Si se está arrastrando una ficha, no dibujarla en su pozo de origen.
    if(pozoEnArrastre && posicionMouse){
    // Dibujar la ficha arrastrada en la posición actual del mouse, encima de todo.
      this.dibujarFichaSiguiendoElMouse(
        fichaElegida.imagenCargada, 
        pozoEnArrastre.x,
        pozoEnArrastre.y
      );
    }
  }

  dibujarFicha(imagen, posX, posY) {
    // Path2D + clip + drawImage, como ya armamos
    //se calcula la dimension de la celda con un 80% para que quede un
    //min elige la dimension mas chica de la celda
    const diametro = Math.min(this.anchoCelda, this.altoCelda) *0.8;
    const centroX = posX + this.anchoCelda /2;
    const centroY = posY + this.altoCelda /2;

    // Recortar un cuadro centrado de la imagen para no deformarla.
    const ladoFuente = Maht.min(imagen.naturalWidth, imagen.naturalHeight);
    const fuenteX = (imagen.naturalWidth - ladoFuente) / 2;
    const fuenteY = (imagen.naturalHeight - ladoFuente)/2;
    
    //dibujamos
    this.ctx.save(); 
    
    this.ctx.beginPath();
    this.ctx.arc(centroX, centroY, diametro / 2, 0, Math.PI * 2);
    this.ctx.clip();

    this.ctx.drawImage(
      imagen, fuenteX, fuenteY, ladoFuente, ladoFuente,
      centroX - diametro/ 2, centroY - diametro / 2, diametro, diametro
    );
    this.ctx.restore(); 
  }

  dibujarFichaSiguiendoElMouse(imagen, posXMouse, posYMouse) {
    // Mientras el jugador arrastra, dibuja la ficha centrada
    // en la posición actual del mouse (encima de todo lo demás)
     this.dibujarFicha(
        imagen,
        posXMouse - this.anchoCelda / 2,
        posYMouse - this.altoCelda / 2
      );
  }

  dibujarHintsAnimados(listaDeMovimientosPosibles, timestampAnimacion) {
    // req. 3: por cada movimiento posible, dibuja una flecha o indicador
    // animado sobre el pozo destino. El timestamp se usa para animar
    // (por ejemplo, haciendo que la flecha "rebote" con un seno/coseno
    // en función del tiempo transcurrido)
    const pulso = (Math.sin(timestampAnimacion / 200) + 1) / 2;

    for(const movimiento of listaDeMovimientosPosibles){
      const {x, y} = this.convertirFilaColumnaAPosicion(
        movimiento.filaDestino, 
        movimiento.columnaDestino,
      );

      const centroX = x + this.anchoCelda / 2; 
      const centroY = y + this.altoCelda / 2; 
      const radio = Math.min(this.anchoCelda, this.altoCelda) *
        (0.18 + pulso * 0.04);

      this.ctx.save();
      this.ctx.globalAlpha = 0.5 + pulso * 0.5;
      this.ctx.strokeStyle = "#fff000"
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(centroX, centroY, radio, 0, Math.PI*2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  convertirPosicionAFilaColumna(posX, posY) {
    // Traduce coordenadas de pantalla a fila/columna del tablero
    const rect = this.canvas.getBoundingClientRect();

    // Posición del mouse relativa al canvas
    const mouseX = posX - rect.left;
    const mouseY = posY - rect.top;

    // Ajuste por si el canvas se muestra con otro tamaño en la página
    const x = mouseX * (this.canvas.width / rect.width);
    const y = mouseY * (this.canvas.height / rect.height);

    // Si el mouse quedó fuera del canvas, no hay fila ni columna
    if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) {
      return null;
    }

    return {
      fila: Math.floor(y / this.altoCelda),
      columna: Math.floor(x / this.anchoCelda)
    };

  }

  convertirFilaColumnaAPosicion(fila, columna) {
    // Traduce fila/columna a coordenadas X/Y del canvas
    // (lo inverso del método anterior, útil para dibujar)
    return {
      x: columna * this.anchoCelda,
      y: fila * this.altoCelda
    }
  }

  mostrarMensajeFinDeJuego(estadoDelJuego) {
    // Muestra el resultado final (ganó / perdió / se acabó el tiempo)
    const mensajes = {
      GANASTE: "¡Ganaste!",
      GANASTE_PERFECTO: "¡Ganaste perfecto!",
      PERDISTE: "No quedan movimientos posibles"
    };

    const mensaje = mensajes[estadoDelJuego];

    if (!mensaje) {
      throw new Error(`Estado de juego desconocido: ${estadoDelJuego}`);
    }

    this.ctx.save();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, this.canvas.height / 2 - 35, this.canvas.width, 70);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "24px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(mensaje, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.restore();
  }
}

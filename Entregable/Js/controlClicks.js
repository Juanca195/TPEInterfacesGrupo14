// Escucha los clicks del canvas y rota la pieza que corresponda.
// Recibe el Rompecabezas (no el array de piezas), así siempre ve las piezas
export class ControlClicks {
  constructor(canvas, rompecabezas, alCambiar) {
    this.canvas = canvas;
    this.rompecabezas = rompecabezas;
    this.alCambiar = alCambiar; 

    this.canvas.addEventListener("mousedown", (e) => this.manejarClick(e));

    // Evita el menú del navegador con el click derecho
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  manejarClick(event) {
    //si esta resuelto no se permiten mas clicks
    if(this.rompecabezas.estaResuelto())return;

    const pieza = this.rompecabezas.buscarPieza(event.offsetX, event.offsetY);
    if (!pieza) return;

    if (event.button === 0) {
      pieza.rotar(90);   // click izquierdo → derecha
    } else if (event.button === 2) {
      pieza.rotar(90);  // click derecho → izquierda
    } else {
      return;
    }

    this.alCambiar();
  }
}
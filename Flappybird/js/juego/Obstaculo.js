/**
 * Representa un par de obstáculos y el hueco que el jugador debe atravesar.
 * Se ocupa de su posición y movimiento, no de dibujarlo ni de detectar choques.
 */
export class Obstaculo {
  constructor(x, sueloY) {
    this.x = x;
    this.ancho = 76;
    this.altoHueco = 175;
    this.huecoY = this.generarPosicionDelHueco(sueloY);
    this.pasado = false;
  }

  // Desplaza el obstáculo hacia la izquierda según la velocidad del juego.
  actualizar(velocidad, deltaTime) {
    this.x -= velocidad * deltaTime;
  }

  // Elige una altura aleatoria que deja espacio entre el techo y el suelo.
  generarPosicionDelHueco(sueloY) {
    const margen = 55;
    const minimo = margen;
    const maximo = sueloY - this.altoHueco - margen;

    return minimo + Math.random() * (maximo - minimo);
  }

  // Devuelve los datos necesarios para dibujar este obstáculo.
  obtenerEstado() {
    return {
      x: this.x,
      ancho: this.ancho,
      huecoY: this.huecoY,
      altoHueco: this.altoHueco
    };
  }
}

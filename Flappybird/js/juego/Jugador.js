/**
 * Representa al personaje y mantiene sus datos de movimiento y animación.
 * No conoce el Canvas; la lógica del juego y el renderizador usan su estado.
 */
export class Jugador {
  constructor(x, y, ancho, alto) {
    this.x = x;
    this.y = y;
    this.ancho = ancho;
    this.alto = alto;
    this.velocidadY = 0;
    this.tiempoAnimacion = 0;
    this.cuadro = 0;
  }

  // Restablece posición, velocidad y animación al comenzar otra partida.
  reiniciar(y) {
    this.y = y;
    this.velocidadY = 0;
    this.tiempoAnimacion = 0;
    this.cuadro = 0;
  }

  // Aplica el impulso vertical correspondiente al salto del jugador.
  saltar() {
    this.velocidadY = -470;
  }

  // Actualiza la caída por gravedad y avanza el cuadro de vuelo.
  actualizar(deltaTime) {
    this.velocidadY += 1500 * deltaTime;
    this.y += this.velocidadY * deltaTime;
    this.tiempoAnimacion += deltaTime;

    if (this.tiempoAnimacion >= 0.12) {
      this.tiempoAnimacion = 0;
      this.cuadro = (this.cuadro + 1) % 3;
    }
  }

  // Expone solo los datos del personaje que necesita la capa de dibujo.
  obtenerEstado() {
    return {
      x: this.x,
      y: this.y,
      ancho: this.ancho,
      alto: this.alto,
      cuadro: this.cuadro
    };
  }
}

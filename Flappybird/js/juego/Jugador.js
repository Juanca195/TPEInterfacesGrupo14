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
  }

  // Restablece posición y velocidad al comenzar otra partida.
  reiniciar(y) {
    this.y = y;
    this.velocidadY = 0;
  }

  // Aplica el impulso vertical correspondiente al salto del jugador.
  saltar() {
    this.velocidadY = -470;
  }

  // Actualiza la caída del jugador por efecto de la gravedad.
  actualizar(deltaTime) {
    this.velocidadY += 1500 * deltaTime;
    this.y += this.velocidadY * deltaTime;
  }

  // Expone los datos de movimiento que necesitan el controlador y el render.
  obtenerEstado() {
    return {
      x: this.x,
      y: this.y,
      ancho: this.ancho,
      alto: this.alto
    };
  }
}

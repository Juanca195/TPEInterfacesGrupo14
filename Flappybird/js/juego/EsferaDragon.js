export class EsferaDragon {
  constructor(x, y, numero) {
    this.x = x;
    this.y = y;
    this.numero = numero;

    this.ancho = 40;
    this.alto = 40;
  }

  actualizar(velocidad, deltaTime) {
    this.x -= velocidad * deltaTime;
  }

  obtenerEstado() {
    return {
      x: this.x,
      y: this.y,
      numero: this.numero,
      ancho: this.ancho,
      alto: this.alto
    };
  }
}
// Representa un dragón enemigo que atraviesa la pantalla.
export class Dragon {
  // Recibe la posición inicial y el tamaño que tendrá su hitbox.
  constructor(x, y, ancho = 150, alto = 97) {
    this.x = x;
    this.y = y;
    this.ancho = ancho;
    this.alto = alto;
  }

// Mueve al dragón horizontalmente; conserva la altura con la que apareció.
actualizar(velocidad, deltaTime) {
  this.x -= velocidad * 1.2 * deltaTime;
}  

  // Devuelve los datos que la vista necesita para dibujar al dragón.
  obtenerEstado() {
    return {
      x: this.x,
      y: this.y,
      ancho: this.ancho,
      alto: this.alto
    };
  }
}
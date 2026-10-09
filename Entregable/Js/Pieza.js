// Sabe dónde está, cuánto está rotado y cómo dibujarse a sí mismo.
export class Pieza {
  constructor(origenX, origenY, origenAncho, origenAlto) {
    // luugar de imagen que le corresponde
    this.origenX = origenX;
    this.origenY = origenY;
    this.origenAncho = origenAncho;
    this.origenAlto = origenAlto;

    // Posición y tamaño en el canvas (los define el Rompecabezas)
    this.destinoX = 0;
    this.destinoY = 0;
    this.ancho = 0;
    this.alto = 0;

    this.rotacion = 0; // en grados
  }

  rotar(grados) {
    this.rotacion = (this.rotacion + grados) % 360;
  }

  // ¿El punto (x, y) cae dentro de esta pieza?
  contienePunto(x, y) {
    return (
      x >= this.destinoX && x <= this.destinoX + this.ancho &&
      y >= this.destinoY && y <= this.destinoY + this.alto
    );
  }

  dibujar(ctx, img) {
    const centroX = this.destinoX + this.ancho / 2;
    const centroY = this.destinoY + this.alto / 2;

    ctx.save();                                   
    ctx.translate(centroX, centroY);               // origen = centro de la pieza
    ctx.rotate((this.rotacion * Math.PI) / 180);   // grados 

    ctx.drawImage(
      img,
      this.origenX, this.origenY, this.origenAncho, this.origenAlto,
      -this.ancho / 2, -this.alto / 2, this.ancho, this.alto
    );

    ctx.restore();                                 // evita que la rotación se acumule
  }
}
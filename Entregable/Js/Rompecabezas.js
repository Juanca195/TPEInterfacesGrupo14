import { Pieza } from "./Pieza.js";

// Maneja el CONJUNTO de piezas: las crea una sola vez 
export class Rompecabezas {
  constructor(img, espacio = 20) {
    this.img = img; 
    this.espacio = espacio; 
    this.piezas = [];
    this.#crearPiezas()
  }

  // Corta la imagen original en 4: arriba-izq, arriba-der, abajo-izq, abajo-der
  #crearPiezas() {
  
    const mitadX = this.img.naturalWidth / 2;
    const mitadY = this.img.naturalHeight / 2;
    


    for (let fila = 0; fila < 2; fila++) {
      for (let col = 0; col < 2; col++) {
        this.piezas.push(new Pieza(col * mitadX, fila * mitadY, mitadX, mitadY));
      }
    }
  
  }

  // Calcula tamaño y posición según el canvas. Se llama al cargar y al
  // redimensionar.
  acomodar(canvasAncho, canvasAlto) {
    const escala = Math.min(
      (canvasAncho * 0.5) / this.img.naturalWidth,
      (canvasAlto * 0.5) / this.img.naturalHeight
    );

    const ancho = this.img.naturalWidth * escala;
    const alto = this.img.naturalHeight * escala;
    const mitadAncho = ancho / 2;
    const mitadAlto = alto / 2;

    // Punto de inicio para centrar el conjunto (incluyendo el espacio)
    const inicioX = (canvasAncho - ancho - this.espacio) / 2;
    const inicioY = (canvasAlto - alto - this.espacio) / 2;

    this.piezas.forEach((pieza, i) => {
      const col = i % 2;
      const fila = Math.floor(i / 2);

      pieza.ancho = mitadAncho;
      pieza.alto = mitadAlto;
      pieza.destinoX = inicioX + col * (mitadAncho + this.espacio);
      pieza.destinoY = inicioY + fila * (mitadAlto + this.espacio);
    });
  }

  dibujar(ctx) {
    for (const pieza of this.piezas) {
      pieza.dibujar(ctx, this.img);
    }
  }

  // Devuelve la pieza que está bajo (x, y), o null si no hay ninguna
  buscarPieza(x, y) {
    return this.piezas.find((pieza) => pieza.contienePunto(x, y)) ?? null;
  }

  // Le da una rotación al azar a cada pieza, y repite si quedó armada
  mezclarPiezas() {
    do {
      for (const pieza of this.piezas) {
        pieza.asignarRotacionAleatoria();
      }
    } while (this.estaResuelto());
  }

  // true si todas las piezas están en 0°
  estaResuelto() {
    return this.piezas.every((pieza) => pieza.estaEnPosicionCorrecta());
  }

}
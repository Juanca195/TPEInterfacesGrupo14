import { Pieza } from "./Pieza.js";

// Maneja el CONJUNTO de piezas: las crea una sola vez 
export class Rompecabezas {
  constructor(img,filas = 3, column = 3, espacio = 20) {
    this.img = img;
    this.filas = filas;
    this.column = column; 
    this.espacio = espacio;
    this.espacioActual = espacio;
    
  // Lado (en px de la imagen original) del cuadrado más grande que entra en la grilla
  this.ladoOrigen = Math.min(
    img.naturalWidth / column,
    img.naturalHeight / filas
    );
    
    this.piezas = this.crearPiezas();
  }

  // Corta la imagen original en 4: arriba-izq, arriba-der, abajo-izq, abajo-der
  crearPiezas() {
  const lado = this.ladoOrigen;

  // Se usa una zona de la imagen centrada, de (lado × columnas) por (lado × filas)
  const inicioX = (this.img.naturalWidth - lado * this.column) / 2;
  const inicioY = (this.img.naturalHeight - lado * this.filas) / 2;

  const piezas = [];
  for (let fila = 0; fila < this.filas; fila++) {
    for (let col = 0; col < this.column; col++) {
      piezas.push(
        new Pieza(inicioX + col * lado, inicioY + fila * lado, lado, lado)
      );
    }
  }
  return piezas;
}

  // Calcula tamaño y posición según el canvas. Se llama al cargar y al
  // redimensionar.
  acomodar(canvasAncho, canvasAlto) {
  // Tamaño de la zona usada de la imagen (no de la imagen completa)
  const zonaAncho = this.ladoOrigen * this.column;
  const zonaAlto = this.ladoOrigen * this.filas;

  const escala = Math.min(
    (canvasAncho * 0.6) / zonaAncho,
    (canvasAlto * 0.6) / zonaAlto
  );

  const lado = this.ladoOrigen * escala; // lado de cada pieza en el canvas

  const anchoTotal = lado * this.column + this.espacioActual * (this.column - 1);
  const altoTotal = lado * this.filas + this.espacioActual * (this.filas - 1);

  const inicioX = (canvasAncho - anchoTotal) / 2;
  const inicioY = (canvasAlto - altoTotal) / 2;

  this.piezas.forEach((pieza, i) => {
    const col = i % this.column;
    const fila = Math.floor(i / this.column);

    pieza.ancho = lado;
    pieza.alto = lado;
    pieza.destinoX = inicioX + col * (lado + this.espacioActual);
    pieza.destinoY = inicioY + fila * (lado + this.espacioActual);
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
  //Actualiza el espacio mostrando la imagen completa una ves resuelta.
  actualizarEspacio(){
    this.espacioActual = this.estaResuelto() ? 0 : this.espacio;
  }

}
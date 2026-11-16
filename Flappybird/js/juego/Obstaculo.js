/**
 * Representa un par de obstáculos y el hueco que el jugador debe atravesar.
 * Se ocupa de su posición y movimiento, no de dibujarlo ni de detectar choques.
 */
export class Obstaculo {
  constructor(x, sueloY, altoHueco, centroHuecoAnterior = null) {
    this.x = x;
    this.ancho = 110;
    this.altoHueco = altoHueco;
    this.huecoY = this.generarPosicionDelHueco(sueloY, centroHuecoAnterior);
    this.pasado = false;
  }

  // Desplaza el obstáculo hacia la izquierda según la velocidad del juego.
  actualizar(velocidad, deltaTime) {
    this.x -= velocidad * deltaTime;
  }

  // Elige una altura aleatoria que deja espacio entre el techo y el suelo.
  generarPosicionDelHueco(sueloY, centroHuecoAnterior) {
    // Mantiene una separación mínima entre el hueco y el techo/suelo.
    const margen = 55;
    // Calcula los centros válidos para que todo el hueco quede dentro del área de juego.
    const centroHuecoMinimo = margen + this.altoHueco / 2;
    const centroHuecoMaximo = sueloY - margen - this.altoHueco / 2;
    let posicionMinima = centroHuecoMinimo;
    let posicionMaxima = centroHuecoMaximo;

    if (centroHuecoAnterior !== null) {
      // Limita el cambio a 80 px; no garantiza que el hueco cambie al menos esa distancia.
      const cambioVerticalMaximo = 100;
      posicionMinima = Math.max(centroHuecoMinimo, centroHuecoAnterior - cambioVerticalMaximo);

      posicionMaxima = Math.min(centroHuecoMaximo, centroHuecoAnterior + cambioVerticalMaximo);
    }

    // Elige al azar el centro dentro del rango permitido.
    const centroHuecoNuevo = posicionMinima
      + Math.random() * (posicionMaxima - posicionMinima);

    // Convierte el centro elegido en la coordenada superior que usa el dibujo.
    return centroHuecoNuevo - this.altoHueco / 2;
  }

  // Devuelve los datos necesarios para dibujar este obstáculo.
  obtenerEstado() {
    return {x: this.x, ancho: this.ancho, huecoY: this.huecoY, altoHueco: this.altoHueco};
  }
}

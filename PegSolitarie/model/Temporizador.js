export class Temporizador {
  constructor(duracionTotalEnSegundos) {
    this.duracionTotalEnSegundos = duracionTotalEnSegundos;
    this.segundosRestantes = duracionTotalEnSegundos;
    this.intervaloId = null;
    this.alActualizar = null;      // callback: se llama cada segundo
    this.alFinalizarTiempo = null; // callback: se llama cuando llega a 0
  }

  iniciar() {
    // Arranca un setInterval que descuenta un segundo,
    // llama a alActualizar(segundosRestantes),
    // y si llega a 0, llama a alFinalizarTiempo()
  }

  detener() {
    // Limpia el intervalo
  }

  reiniciar() {
    // Vuelve segundosRestantes a duracionTotalEnSegundos
  }
}
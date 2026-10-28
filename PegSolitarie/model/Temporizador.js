import { Tablero } from "./Tablero";

export class Temporizador {
  constructor(duracionTotalEnSegundos) {
    this.duracionTotalEnSegundos = duracionTotalEnSegundos;
    this.segundosRestantes = duracionTotalEnSegundos;
    this.intervaloId = null;
    this.alActualizar = null;      // callback: se llama cada segundo
    this.alFinalizarTiempo = null; // callback: se llama cuando llega a 0
  }

  iniciar() {
    // Si ya había un intervalo corriendo, lo limpiamos antes de arrancar uno nuevo,
    // para evitar que queden dos intervalos descontando al mismo tiempo
    if (this.intervaloId !== null) {
      clearInterval(this.intervaloId);
    }
 
    this.intervaloId = setInterval(() => {
 
      this.segundosRestantes = this.segundosRestantes - 1;
 
      // actualizamos el tiempo 
      if (this.alActualizar !== null) {
        this.alActualizar(this.segundosRestantes);
      }
 
      // Si llegamos a 0, detenemos el intervalo y avisamos que se acabó el tiempo
      if (this.segundosRestantes <= 0) {
        this.detener();
 
        if (this.alFinalizarTiempo !== null) {
          this.alFinalizarTiempo();
        }
      }
 
    }, 1000); // 1000 milisegundos = 1 segundo
  }

  detener() {
    // si hay un intervalo activo lo matamos
    if (this.intervaloId !== null) {
      clearInterval(this.intervaloId);
      this.intervaloId = null;
    }
  }

  reiniciar() {
    
    // apagamos el juego
    this.detener()

    //reiniciamos el tiempo
    this.segundosRestantes = this.duracionTotalEnSegundos;
    
    //avisamos a la vista
    if(this.alActualizar != null)
      this.alActualizar(this.segundosRestantes)


  }
}
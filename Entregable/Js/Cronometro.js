// Cuenta regresiva simple.
// Muestra el tiempo en un elemento del HTML y avisa cuando llega a cero.
export class Cronometro {
  constructor(elemento, alTerminar) {
    this.elemento = elemento;       // el <div> donde se muestra el tiempo
    this.alTerminar = alTerminar;   // función que se ejecuta al llegar a 0
    this.segundosRestantes = 0;
    this.intervalo = null;
  }

  // Arranca (o reinicia) la cuenta regresiva desde "segundos"
  iniciar(segundos) {
    this.detener();
    this.segundosRestantes = segundos;
    this.mostrar();

    this.intervalo = setInterval(() => {
      this.segundosRestantes--;
      this.mostrar();

      if (this.segundosRestantes <= 0) {
        this.detener();
        this.alTerminar();
      }
    }, 1000);
  }

  detener() {
    clearInterval(this.intervalo);
    this.intervalo = null;
  }

  // Escribe el tiempo con formato m:ss (por ejemplo 1:05)
  mostrar() {
    const min = Math.floor(this.segundosRestantes / 60);
    const seg = this.segundosRestantes % 60;
    this.elemento.textContent = `${min}:${String(seg).padStart(2, "0")}`;

    // En los últimos 10 segundos el número se pone rojo (ver CSS)
    this.elemento.classList.toggle("poco-tiempo", this.segundosRestantes <= 10);
  }
}
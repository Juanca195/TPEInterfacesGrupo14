// Muestra el tiempo en un elemento del HTML y avisa cuando llega a cero.
export class Cronometro {
  constructor(elemento, alTerminar) {
    this.elemento = elemento;       
    this.alTerminar = alTerminar;   
    this.segundosRestantes = 0;
    this.intervalo = null;
    this.inicio = 0; 
  }

  // Segundos que pasaron desde que arrancó (redondeado hacia arriba, mínimo 1)
get segundosUsados() {
  return Math.ceil((Date.now() - this.inicio) / 1000);
}

// Convierte segundos a "m:ss" (sirve para el cronómetro y para el récord)
static formatear(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

  // Arranca la cuenta regresiva desde "segundos"
  iniciar(segundos) {
    this.inicio = Date.now();
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
    this.elemento.textContent = Cronometro.formatear(this.segundosRestantes);
    this.elemento.classList.toggle("poco-tiempo", this.segundosRestantes <= 10);

    // En los últimos 10 segundos el número se pone rojo (ver CSS)
    this.elemento.classList.toggle("poco-tiempo", this.segundosRestantes <= 10);
  }
}
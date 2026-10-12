export class Records {
  constructor(clave = "blocka-records") {
    this.clave = clave;        // nombre con el que se guarda en localStorage
    this.datos = this.leer(); 
  }

  leer() {
    try {
      return JSON.parse(localStorage.getItem(this.clave)) ?? {};
    } catch {
      return {};
    }
  }

  // Mejor tiempo (en segundos) del nivel, o null si todavía no hay
  obtener(nivel) {
    return this.datos[nivel] ?? null;
  }

  // Guarda el tiempo solo si mejora el récord.
  // Devuelve true si es un récord nuevo.
  guardar(nivel, segundos) {
    const actual = this.obtener(nivel);
    if (actual !== null && segundos >= actual) return false;

    this.datos[nivel] = segundos;
    try {
      localStorage.setItem(this.clave, JSON.stringify(this.datos));
    } catch {
      // Si el navegador no deja guardar, el récord dura solo mientras la página está abierta
    }
    return true;
  }
}
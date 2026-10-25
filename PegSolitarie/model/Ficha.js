export class Ficha {
  constructor(nombreFicha, rutaImagen) {
    this.nombreFicha = nombreFicha;
    this.rutaImagen = rutaImagen;
    this.imagenCargada = null;
  }

  cargarImagen() {
    // Crea un objeto Image, asigna el src,
    // devuelve una Promise que resuelve cuando termina de cargar
  }
}
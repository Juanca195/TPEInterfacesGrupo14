export class Ficha {
  constructor(nombreFicha, rutaImagen) {
    this.nombreFicha = nombreFicha;
    this.rutaImagen = rutaImagen;
    this.imagenCargada = null;
  }

  cargarImagen() {
    // Crea un objeto Image, asigna el src,
    // devuelve una Promise que resuelve cuando termina de cargar
    return new Promise((resolve, reject) =>{
      const imagen = new Image();
      imagen.onload = () =>{
        this.imagenCargada = imagen;
        resolve(imagen);
      };
      imagen.onerror = () =>{
        reject(new Error(`No se pudo cargar la imagen: ${this.rutaImagen}`));
      };

      imagen.src = this.rutaImagen;
    })
  }
}
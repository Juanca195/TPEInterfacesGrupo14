export class VistaMenu {
  constructor( contenedorHTML,
  listaDeFichasDisponibles,
  pantallaSeleccion,
  controlesJuego,
  instrucciones) {
    this.contenedorHTML = contenedorHTML;
    this.listaDeFichasDisponibles = listaDeFichasDisponibles; // varios tipos de ficha (req. 9)
    this.pantallaSeleccion = pantallaSeleccion;
    this.controlesJuego = controlesJuego;
    this.instrucciones = instrucciones;
  }


  mostrarSelectorDeFicha(alElegirFicha) {
    this.pantallaSeleccion.hidden = false;
    this.controlesJuego.classList.remove("visible");
    this.instrucciones.hidden = true;
    //limpia el contenedor pos si llama mas de una vez 
    this.contenedorHTML.replaceChildren();

    //recorremos las lista de fichas disponibles
    for (const ficha of this.listaDeFichasDisponibles) {
      const boton = document.createElement("button");
      boton.type = "button";
      //asignamos una clase para poder darle estilo
      boton.classList.add("opcion-ficha");

      const imagen = document.createElement("img");
      imagen.src = ficha.rutaImagen;
      imagen.alt = "";
      imagen.classList.add("opcion-ficha");

      const nombre = document.createElement("samp");
      nombre.textContent = ficha.nombreFicha;

      //mete la imagen y el nombre dentro del boton
      boton.append(imagen, nombre);
      //preparamos al boton para que al hacer click llame al callback con la ficha correspondiente
      boton.addEventListener("click", () => alElegirFicha(ficha));

      //agrega el boton al contenedor Html.
      this.contenedorHTML.appendChild(boton);
    }

  }

  ocultar() {
    this.pantallaSeleccion.hidden = true;
    this.controlesJuego.classList.add("visible");
    this.instrucciones.hidden = false;
  }

}

export class VistaMenu {
  constructor(contenedorHTML, listaDeFichasDisponibles) {
    this.contenedorHTML = contenedorHTML;
    this.listaDeFichasDisponibles = listaDeFichasDisponibles; // varios tipos de ficha (req. 9)
  }


  mostrarSelectorDeFicha(alElegirFicha) {
    //limpia el contenedor pos si llama mas de una vez 
   this.contenedorHTML.replaceChildren();

   //recorremos las lista de fichas disponibles
   for(const ficha of this.listaDeFichasDisponibles){
    const boton = document.createElement("button");
    boton.type = "button";
    //asignamos una clase para poder darle estilo
    boton.classList.add("opcion-ficha");

    const imagen = document.createElement("img");
    imagen.src = ficha.rutaImagen;
    imagen.alt = "";
    imagen.classList.add("opciion-ficha");

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

  mostrarInstrucciones() {
    // Muestra el texto de "cómo jugar" + imágenes descriptivas (req. 8)
    const instruccionesAnteriores = this.contenedorHTML.querySelector(".instrucciones");

    if (instruccionesAnteriores) {
      instruccionesAnteriores.remove();
    }
    // podria cambiar
    const instrucciones = [
      {
        titulo: "Saltá sobre una ficha",
        texto:
          "Mové una ficha en línea recta sobre otra ficha hasta un pozo vacío. La ficha saltada se retira del tablero.",
        imagen: "../assets/instrucciones/salto.svg",
        descripcion:
          "Ejemplo de un salto: una ficha salta sobre otra hacia un pozo vacío.",
      },
      {
        titulo: "Intentá dejar una sola ficha",
        texto:
          "Seguí haciendo movimientos válidos. El objetivo es terminar con una sola ficha en el tablero.",
        imagen: "../assets/instrucciones/objetivo.svg",
        descripcion: "Tablero con una sola ficha restante.",
      },
    ];

    //craemos todos los elementos Html y agregamos
    const seccion = document.createElement("section");
    seccion.classList.add("instrucciones");

    const titulo = document.createElement("h2");
    titulo.textContent = "Cómo jugar";
    seccion.appendChild(titulo);

    // por cada vuelta crea un un articulo de instruccion 
    for (const instruccion of instrucciones) {
      const articulo = document.createElement("article");
      articulo.classList.add("instrucciones-paso");

      const subtitulo = document.createElement("h3");
      subtitulo.textContent = instruccion.titulo;

      const imagen = document.createElement("img");
      imagen.src = instruccion.imagen;
      imagen.alt = instruccion.descripcion;
      imagen.classList.add("instrucciones-imagen");
      imagen.loading = "lazy";

      const texto = document.createElement("p");
      texto.textContent = instruccion.texto;

      articulo.append(subtitulo, imagen, texto);
      seccion.appendChild(articulo);
    }
    // agrega la seccion al html
    this.contenedorHTML.appendChild(seccion);
}

  ocultar() {
    // Esconde el menú para mostrar el tablero
    this.contenedorHTML.hidden = true; 
  }
}


// ===================================================
// VIEW: VistaTemporizador
// Muestra el tiempo restante en pantalla
// ===================================================
export class VistaTemporizador {
  constructor(elementoHTML) {
    this.elementoHTML = elementoHTML;
  }

  actualizar(segundosRestantes) {
    // Formatea y muestra el tiempo (ej: "02:45")
  }
}
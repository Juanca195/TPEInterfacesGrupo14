/**
 * Representa en el DOM el estado que recibe del juego.
 * Crea los elementos HTML una sola vez y en cada cuadro solo actualiza
 * su posición: no cambia datos ni aplica reglas de partida.
 */

// Empieza a usar el suelo desde el 57 % de la imagen: se queda con su franja inferior.
// Ejemplo: si la imagen mide 568 px de alto, el recorte empieza cerca del píxel 324.
const FRACCION_RECORTE_SUELO = 0.57;

// Ordenadas del fondo hacia el frente: cielo, montañas y árboles.
// Cada capa define su velocidad relativa, posición vertical y alto dibujado.
// Un factor 0.1 mueve el cielo 10 px por cada 100 px que avanza el juego.
const CAPAS_PARALLAX = [
  {
    archivo: "capa_cielo_completo.png",
    factor: 0.1,
    y: 0,
    alto: 600
  },
  {
    archivo: "montania_sin_fondo.png",
    factor: 0.25,
    y: 260,
    alto: 280,
    repetirConEspejo: true
  },
  {
    archivo: "arboles_sin_fondo.png",
    factor: 0.45,
    y: 20,
    alto: 540,
  }
];

export class Vista {
  constructor(escenario) {
    if (!escenario) {
      throw new Error("La vista necesita el elemento HTML del escenario.");
    }

    this.escenario = escenario;
    this.escala = 1;

    // Listas de elementos HTML que se reutilizan entre cuadros.
    this.obstaculos = [];
    this.esferas = [];
    this.dragones = [];

    // Cada capa parallax es un div con la imagen como fondo repetido en horizontal.
    this.capasParallax = CAPAS_PARALLAX.map((definicion, indice) => {
      const elemento = document.createElement("div");
      elemento.className = "capa";
      elemento.style.top = `${definicion.y}px`;
      elemento.style.height = `${definicion.alto}px`;
      elemento.style.zIndex = String(indice);
      this.escenario.append(elemento);

      this.cargarImagen(definicion.archivo, (imagen) => {
        this.prepararCapa(definicion, elemento, imagen);
      });

      return { ...definicion, elemento };
    });

    // El suelo es otro div; mientras la imagen no carga se ve el color de respaldo del CSS.
    this.suelo = document.createElement("div");
    this.suelo.className = "suelo";
    this.escenario.append(this.suelo);

    this.cargarImagen("suelo_sin_fondo.png", (imagen) => {
      // Se recorta la franja inferior y se le agrega su reflejo para ocultar la unión.
      this.aplicarFondo(
        this.suelo,
        this.crearTiraEspejada(imagen, FRACCION_RECORTE_SUELO)
      );
    });
  }

  establecerEscala(escala) {
    this.escala = escala;
  }

  // Carga una imagen y deja registrado su error si no se encuentra.
  cargarImagen(nombreArchivo, alCargar = null) {
    const imagen = new Image();
    imagen.addEventListener("error", () => {
      console.error(`No se pudo cargar ${nombreArchivo}`);
    });

    if (alCargar !== null) {
      imagen.addEventListener("load", () => alCargar(imagen), { once: true });
    }

    imagen.src = new URL(`../../img/${nombreArchivo}`, import.meta.url).href;
    return imagen;
  }

  // Limpia o espeja la imagen si hace falta y la pone como fondo de la capa.
  prepararCapa(capa, elemento, imagen) {
    let fuente = imagen;

    if (capa.repetirConEspejo) {
      fuente = this.crearTiraEspejada(fuente);
    }

    this.aplicarFondo(elemento, fuente);
  }

  // Usa una imagen o un canvas (fuera de pantalla) como fondo de un elemento.
  aplicarFondo(elemento, fuente) {
    if (fuente instanceof HTMLCanvasElement) {
      fuente.toBlob((blob) => {
        if (blob === null) {
          console.error("No se pudo convertir el canvas en imagen.");
          return;
        }
        elemento.style.backgroundImage = `url("${URL.createObjectURL(blob)}")`;
      });
      return;
    }

    elemento.style.backgroundImage = `url("${fuente.src}")`;
  }

  // Devuelve la imagen seguida de su reflejo. Al repetirla con CSS,
  // las copias alternas quedan espejadas y no se nota la unión.
  // "fraccionInicio" permite quedarse solo con la parte inferior de la imagen.
  crearTiraEspejada(fuente, fraccionInicio = 0) {
    const anchoFuente = fuente.naturalWidth || fuente.width;
    const altoCompleto = fuente.naturalHeight || fuente.height;
    const inicioY = Math.round(altoCompleto * fraccionInicio);
    const alto = altoCompleto - inicioY;

    const lienzo = document.createElement("canvas");
    lienzo.width = anchoFuente * 2;
    lienzo.height = alto;

    const contexto = lienzo.getContext("2d");
    if (!contexto) {
      throw new Error("No se pudo preparar la tira espejada.");
    }

    // Copia original a la izquierda.
    contexto.drawImage(fuente, 0, inicioY, anchoFuente, alto, 0, 0, anchoFuente, alto);

    // Copia reflejada a la derecha.
    contexto.translate(lienzo.width, 0);
    contexto.scale(-1, 1);
    contexto.drawImage(fuente, 0, inicioY, anchoFuente, alto, 0, 0, anchoFuente, alto);

    return lienzo;
  }

  // Actualiza todos los elementos según el estado actual del juego.
  dibujar(estado) {
    // Cada capa avanza a su propia velocidad; el CSS repite la imagen sin costuras.
    for (const capa of this.capasParallax) {
      const desplazamiento = Math.floor(estado.desplazamientoSuelo * capa.factor);
      capa.elemento.style.backgroundPositionX = `${-desplazamiento}px`;
    }

    this.sincronizarObstaculos(estado);
    this.sincronizarEsferas(estado);
    this.actualizarSuelo(estado);
    // Actualiza los dragones en pantalla con las posiciones del modelo.
    this.sincronizarDragones(estado);
  }
  // Crea, posiciona y elimina los elementos visuales de los dragones.
  sincronizarDragones(estado) {
    const dragones = estado.dragones ?? [];

    // Crea un elemento HTML por cada dragón nuevo.
    while (this.dragones.length < dragones.length) {
      const elemento = document.createElement("div");
      elemento.className = "dragon";
      elemento.setAttribute("aria-hidden", "true");
      this.escenario.append(elemento);
      this.dragones.push(elemento);
    }

    // Elimina elementos que ya no están en el estado del juego.
    while (this.dragones.length > dragones.length) {
      this.dragones.pop().remove();
    }

    // Actualiza la posición y el tamaño de cada elemento existente.
    dragones.forEach((datos, indice) => {
      const elemento = this.dragones[indice];

      elemento.style.left = `${datos.x}px`;
      elemento.style.top = `${datos.y}px`;
      elemento.style.width = `${datos.ancho}px`;
      elemento.style.height = `${datos.alto}px`;
    });
  }

  // Coloca el suelo y lo desplaza a la velocidad del juego.
  actualizarSuelo(estado) {
    this.suelo.style.top = `${estado.sueloY}px`;
    this.suelo.style.height = `${estado.altoSuelo}px`;
    this.suelo.style.backgroundPositionX = `${-Math.floor(estado.desplazamientoSuelo)}px`;
  }

  // Mantiene un par de rocas (arriba y abajo) por cada obstáculo del estado.
  sincronizarObstaculos(estado) {
    while (this.obstaculos.length < estado.obstaculos.length) {
      const arriba = document.createElement("div");
      arriba.className = "roca roca--arriba";
      const abajo = document.createElement("div");
      abajo.className = "roca";

      this.escenario.append(arriba, abajo);
      this.obstaculos.push({ arriba, abajo });
    }

    while (this.obstaculos.length > estado.obstaculos.length) {
      const sobrante = this.obstaculos.pop();
      sobrante.arriba.remove();
      sobrante.abajo.remove();
    }

    estado.obstaculos.forEach((datos, indice) => {
      const { arriba, abajo } = this.obstaculos[indice];
      const escalaEnPixeles = this.escala * window.devicePixelRatio;
      const xVisual = Math.round(datos.x * escalaEnPixeles) / escalaEnPixeles;

      // El tramo inferior comienza justo después del hueco.
      // Ejemplo: huecoY 180 + altoHueco 150 = inicio inferior en y 330.
      const inicioParteInferior = datos.huecoY + datos.altoHueco;

      // La roca de arriba va desde el techo hasta el comienzo del hueco.
      arriba.style.left = `${xVisual}px`;
      arriba.style.top = "0px";
      arriba.style.width = `${datos.ancho}px`;
      arriba.style.height = `${Math.max(0, datos.huecoY)}px`;

      // La roca de abajo va desde el final del hueco hasta el suelo.
      abajo.style.left = `${xVisual}px`;
      abajo.style.top = `${inicioParteInferior}px`;
      abajo.style.width = `${datos.ancho}px`;
      abajo.style.height = `${Math.max(0, estado.sueloY - inicioParteInferior)}px`;
    });
  }

  // Mantiene un elemento por cada esfera del estado. La flotación la hace el CSS.
  sincronizarEsferas(estado) {
    const esferas = estado.esferas ?? [];

    while (this.esferas.length < esferas.length) {
      const elemento = document.createElement("div");
      elemento.className = "esfera";
      this.escenario.append(elemento);
      this.esferas.push(elemento);
    }
    while (this.esferas.length > esferas.length) {
      this.esferas.pop().remove();
    } 
    esferas.forEach((datos, indice) => {
      const elemento = this.esferas[indice];
      const cantidadEsferas = 7;

      const anchoVisual = 42;
      const altoVisual = 102;

      elemento.style.left = `${datos.x}px`;

      // Centra la esfera visible respecto de su posición lógica.
      elemento.style.top = `${datos.y - (altoVisual - datos.alto) / 2}px`;

      elemento.style.width = `${anchoVisual}px`;
      elemento.style.height = `${altoVisual}px`;

      const porcentajeX =
        ((datos.numero - 1) / (cantidadEsferas - 1)) * 100;

      elemento.style.backgroundPositionX = `${porcentajeX}%`;
    });
  }

 
}








/**
 * Representa en el DOM el estado que recibe del juego.
 * Crea los elementos HTML una sola vez y en cada cuadro solo actualiza
 * su posición: no cambia datos ni aplica reglas de partida.
 */

// Empieza a usar el suelo desde el 57 % de la imagen: se queda con su franja inferior.
// Ejemplo: si la imagen mide 568 px de alto, el recorte empieza cerca del píxel 324.
const FRACCION_RECORTE_SUELO = 0.57;

// Evita los dos árboles que ya vienen cortados por el borde superior de arboles.png.
const RECORTE_HORIZONTAL_ARBOLES = { x: 1672, ancho: 2200 };

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
    archivo: "arboles.png",
    factor: 0.45,
    y: 0,
    alto: 540,
    quitarCuadricula: true
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

    if (capa.quitarCuadricula) {
      fuente = this.quitarCuadriculaYRecortar(imagen, RECORTE_HORIZONTAL_ARBOLES);
    }

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

  // Quita los píxeles grises de la cuadrícula y recorta el área transparente.
  // Usa un canvas fuera de pantalla solo para procesar la imagen.
  quitarCuadriculaYRecortar(imagen, recorteHorizontal) {
    const lienzoCompleto = document.createElement("canvas");
    lienzoCompleto.width = imagen.naturalWidth;
    lienzoCompleto.height = imagen.naturalHeight;

    const contextoCompleto = lienzoCompleto.getContext("2d", {
      willReadFrequently: true
    });
    if (!contextoCompleto) {
      throw new Error("No se pudo procesar la imagen de árboles.");
    }

    contextoCompleto.drawImage(imagen, 0, 0);
    const pixeles = contextoCompleto.getImageData(
      0,
      0,
      lienzoCompleto.width,
      lienzoCompleto.height
    );
    const ancho = lienzoCompleto.width;
    const alto = lienzoCompleto.height;
    const esPixelDeCuadricula = (indiceColor) => {
      const rojo = pixeles.data[indiceColor];
      const verde = pixeles.data[indiceColor + 1];
      const azul = pixeles.data[indiceColor + 2];
      const diferenciaColor = Math.max(rojo, verde, azul)
        - Math.min(rojo, verde, azul);
      const brillo = (rojo + verde + azul) / 3;

      return diferenciaColor <= 22 && brillo >= 100 && brillo <= 240;
    };

    // Los cuadros pueden quedar encerrados entre árboles, por eso se limpian en toda la imagen.
    for (let indicePixel = 0; indicePixel < ancho * alto; indicePixel += 1) {
      const indiceColor = indicePixel * 4;
      if (
        pixeles.data[indiceColor + 3] !== 0
        && esPixelDeCuadricula(indiceColor)
      ) {
        pixeles.data[indiceColor + 3] = 0;
      }
    }

    contextoCompleto.putImageData(pixeles, 0, 0);

    // Encuentra los límites de los árboles para quitar el margen vacío de la imagen.
    const inicioRecorteX = Math.min(recorteHorizontal.x, ancho - 1);
    const finRecorteX = Math.min(
      ancho,
      recorteHorizontal.x + recorteHorizontal.ancho
    );
    let minimoX = finRecorteX;
    let minimoY = alto;
    let maximoX = inicioRecorteX - 1;
    let maximoY = -1;

    for (let y = 0; y < alto; y += 1) {
      for (let x = inicioRecorteX; x < finRecorteX; x += 1) {
        const indiceAlfa = (y * ancho + x) * 4 + 3;
        if (pixeles.data[indiceAlfa] === 0) {
          continue;
        }

        minimoX = Math.min(minimoX, x);
        minimoY = Math.min(minimoY, y);
        maximoX = Math.max(maximoX, x);
        maximoY = Math.max(maximoY, y);
      }
    }

    if (maximoX < minimoX || maximoY < minimoY) {
      throw new Error("La imagen de árboles quedó vacía al quitar la cuadrícula.");
    }

    const lienzoRecortado = document.createElement("canvas");
    lienzoRecortado.width = maximoX - minimoX + 1;
    lienzoRecortado.height = maximoY - minimoY + 1;
    const contextoRecortado = lienzoRecortado.getContext("2d");
    if (!contextoRecortado) {
      throw new Error("No se pudo recortar la imagen de árboles.");
    }

    contextoRecortado.drawImage(
      lienzoCompleto,
      minimoX,
      minimoY,
      lienzoRecortado.width,
      lienzoRecortado.height,
      0,
      0,
      lienzoRecortado.width,
      lienzoRecortado.height
    );
    return lienzoRecortado;
  }
}







// /**
//  * Dibuja en el Canvas el estado que recibe del juego.
//  * Solo representa datos: no cambia posiciones ni aplica reglas de partida.
//  */
// // Colores de respaldo que se ven mientras las imágenes no están listas.
// const COLOR_CIELO = "#87ceeb";
// const COLOR_BASE_SUELO = "#633b2e";

// // Empieza a usar el suelo desde el 57 % de la imagen: se queda con su franja inferior.
// // Ejemplo: si la imagen mide 568 px de alto, el recorte empieza cerca del píxel 324.
// const FRACCION_RECORTE_SUELO = .57;

// // Evita los dos árboles que ya vienen cortados por el borde superior de arboles.png.
// const RECORTE_HORIZONTAL_ARBOLES = { x: 1672, ancho: 2200 };

// // Ordenadas del fondo hacia el frente: cielo, montañas y árboles.
// // Cada capa define su velocidad relativa, posición vertical y alto dibujado.
// // Un factor 0.1 mueve el cielo 10 px por cada 100 px que avanza el juego.
// const CAPAS_PARALLAX = [
//   { archivo: "capa_cielo_completo.png", 
//     factor: 0.1, 
//     y: 0, 
//     alto: 600 },
//   {
//     archivo: "montania_sin_fondo.png",
//     factor: 0.25,
//     y: 260,
//     alto: 280,
//     repetirConEspejo: true
//   },
//   {
//     archivo: "arboles.png",
//     factor: 0.45,
//     y: 0,
//     alto: 540,
//     quitarCuadricula: true
//   }
// ];

// export class Vista {
//   constructor(canvas) {
//     this.contexto = canvas.getContext("2d");

//     if (!this.contexto) {
//       throw new Error("No se pudo crear el contexto 2D del Canvas.");
//     }

//     // Carga el suelo y los obstáculos; cielo, montañas y árboles son capas parallax.
//     this.imagenSuelo = this.cargarImagen("suelo_sin_fondo.png");
//     this.imagenObstaculo = this.cargarImagen(
//       "roca_obstaculo_transparente.png"
//     );
//     this.capasParallax = CAPAS_PARALLAX.map((definicion) => {
//       const capa = { ...definicion };
//       const procesarImagen = capa.quitarCuadricula
//         ? (imagen) => {
//             capa.imagen = this.quitarCuadriculaYRecortar(
//               imagen,
//               RECORTE_HORIZONTAL_ARBOLES
//             );
//           }
//         : null;

//       capa.imagen = this.cargarImagen(capa.archivo, procesarImagen);
//       return capa;
//     });

//     this.imagenEsferas = this.cargarImagen("esferas_dragon.png" );
//     this.tiempoAnimacion = 0; 
//   }

//   // Carga una imagen y deja registrado su error si no se encuentra.
//   cargarImagen(nombreArchivo, alCargar = null) {
//     const imagen = new Image();
//     imagen.addEventListener("error", () => {
//       console.error(`No se pudo cargar ${nombreArchivo}`);
//     });

//     // Permite limpiar la imagen antes de que la capa empiece a dibujarse.
//     if (alCargar !== null) {
//       imagen.addEventListener("load", () => alCargar(imagen), { once: true });
//     }

//     imagen.src = new URL(`../../img/${nombreArchivo}`, import.meta.url).href;
//     return imagen;
//   }

//   // Dibuja del fondo hacia el frente: cielo, montañas, árboles y suelo.
//   dibujar(estado) {
//     this.dibujarFondo(estado);
//     this.dibujarCapasParallax(estado);

//     for (const obstaculo of estado.obstaculos) {
//       this.dibujarObstaculo(obstaculo, estado.sueloY);
//     }
//     if (estado.esferas) {
//       for (const esfera of estado.esferas) {
//         this.dibujarEsfera(esfera);
//       }
//     }
//     this.tiempoAnimacion += 0.05; 
//     this.dibujarSuelo(estado);
//   }

// // Dibuja una esfera del dragón en el canvas, seleccionando la esfera
// // correspondiente de la imagen original según su número.
// // También aplica un pequeño movimiento vertical para generar
// // una animación de flotación, sin modificar la posición real de la esfera
// // dentro del juego.
//  dibujarEsfera(esfera) {
//   const imagen = this.imagenEsferas;

//   if (!imagen.complete || imagen.naturalWidth === 0) {
//     return;
//   }

//   const cantidadEsferas = 7;

//   const anchoFuente = imagen.naturalWidth / cantidadEsferas;

//   const tamañoFuente = Math.min(
//     anchoFuente,
//     imagen.naturalHeight
//   );

//   const posicionX =
//     (esfera.numero - 1) * anchoFuente
//     + (anchoFuente - tamañoFuente) / 2;

//   const posicionY =
//     (imagen.naturalHeight - tamañoFuente) / 2;

//   const movimientoY =
//     Math.sin(this.tiempoAnimacion) * 5;

//   this.contexto.drawImage(
//     imagen,
//     posicionX,
//     posicionY,
//     tamañoFuente,
//     tamañoFuente,
//     esfera.x,
//     esfera.y + movimientoY,
//     esfera.ancho,
//     esfera.alto
//   );
// }
//   // Dibuja cada capa parallax usando su velocidad y posición configuradas.
//   dibujarCapasParallax(estado) {
//     for (const capa of this.capasParallax) {
//       const imagen = capa.imagen;
//       const anchoImagen = imagen.naturalWidth || imagen.width;
//       const altoImagen = imagen.naturalHeight || imagen.height;

//       // Si la imagen aún no está lista, se omite hasta el siguiente cuadro.
//       if (anchoImagen === 0 || altoImagen === 0) {
//         continue;
//       }

//       this.dibujarCapaParallax(capa, estado);
//     }
//   }

//   // Repite una capa horizontalmente de acuerdo con su factor de velocidad.
//   dibujarCapaParallax(capa, estado) {
//     const imagen = capa.imagen;
//     // Mantiene la proporción usando el alto configurado de la capa.
//     const anchoOriginal = imagen.naturalWidth || imagen.width;
//     const altoOriginal = imagen.naturalHeight || imagen.height;
//     const ancho = anchoOriginal * (capa.alto / altoOriginal);
//     // El módulo mantiene el desplazamiento dentro de una repetición.
//     // Ejemplo: 1.000 px recorridos con factor 0.1 desplazan esta capa 100 px.
//     const desplazamiento =
//       (estado.desplazamientoSuelo * capa.factor) % ancho;

//     // Dibuja copias consecutivas para cubrir el ancho visible del Canvas.
//     let indiceCapa = 0;
//     for (let x = -Math.floor(desplazamiento); x < estado.ancho; x += ancho) {
//       if (capa.repetirConEspejo && indiceCapa % 2 === 1) {
//         this.contexto.save();
//         this.contexto.translate(Math.floor(x) + ancho, 0);
//         this.contexto.scale(-1, 1);
//         this.contexto.drawImage(
//           imagen,
//           0,
//           capa.y,
//           ancho,
//           capa.alto
//         );
//         this.contexto.restore();
//       } else {
//         this.contexto.drawImage(
//           imagen,
//           Math.floor(x),
//           capa.y,
//           ancho,
//           capa.alto
//         );
//       }
//       indiceCapa += 1;
//     }
//   }

//   // Limpia el Canvas antes de dibujar las capas del cielo y del paisaje.
//   dibujarFondo(estado) {
//     const contexto = this.contexto;
//     contexto.fillStyle = COLOR_CIELO;
//     contexto.fillRect(0, 0, estado.ancho, estado.alto);
//   }

//   // Quita los píxeles grises de la cuadrícula y recorta el área transparente.
//   quitarCuadriculaYRecortar(imagen, recorteHorizontal) {
//     const lienzoCompleto = document.createElement("canvas");
//     lienzoCompleto.width = imagen.naturalWidth;
//     lienzoCompleto.height = imagen.naturalHeight;

//     const contextoCompleto = lienzoCompleto.getContext("2d", {
//       willReadFrequently: true
//     });
//     if (!contextoCompleto) {
//       throw new Error("No se pudo procesar la imagen de árboles.");
//     }

//     contextoCompleto.drawImage(imagen, 0, 0);
//     const pixeles = contextoCompleto.getImageData(
//       0,
//       0,
//       lienzoCompleto.width,
//       lienzoCompleto.height
//     );
//     const ancho = lienzoCompleto.width;
//     const alto = lienzoCompleto.height;
//     const esPixelDeCuadricula = (indiceColor) => {
//       const rojo = pixeles.data[indiceColor];
//       const verde = pixeles.data[indiceColor + 1];
//       const azul = pixeles.data[indiceColor + 2];
//       const diferenciaColor = Math.max(rojo, verde, azul)
//         - Math.min(rojo, verde, azul);
//       const brillo = (rojo + verde + azul) / 3;

//       return diferenciaColor <= 22 && brillo >= 100 && brillo <= 240;
//     };

//     // Los cuadros pueden quedar encerrados entre árboles, por eso se limpian en toda la imagen.
//     for (let indicePixel = 0; indicePixel < ancho * alto; indicePixel += 1) {
//       const indiceColor = indicePixel * 4;
//       if (
//         pixeles.data[indiceColor + 3] !== 0
//         && esPixelDeCuadricula(indiceColor)
//       ) {
//         pixeles.data[indiceColor + 3] = 0;
//       }
//     }

//     contextoCompleto.putImageData(pixeles, 0, 0);

//     // Encuentra los límites de los árboles para quitar el margen vacío de la imagen.
//     const inicioRecorteX = Math.min(recorteHorizontal.x, ancho - 1);
//     const finRecorteX = Math.min(
//       ancho,
//       recorteHorizontal.x + recorteHorizontal.ancho
//     );
//     let minimoX = finRecorteX;
//     let minimoY = alto;
//     let maximoX = inicioRecorteX - 1;
//     let maximoY = -1;

//     for (let y = 0; y < alto; y += 1) {
//       for (let x = inicioRecorteX; x < finRecorteX; x += 1) {
//         const indiceAlfa = (y * ancho + x) * 4 + 3;
//         if (pixeles.data[indiceAlfa] === 0) {
//           continue;
//         }

//         minimoX = Math.min(minimoX, x);
//         minimoY = Math.min(minimoY, y);
//         maximoX = Math.max(maximoX, x);
//         maximoY = Math.max(maximoY, y);
//       }
//     }

//     if (maximoX < minimoX || maximoY < minimoY) {
//       throw new Error("La imagen de árboles quedó vacía al quitar la cuadrícula.");
//     }

//     const lienzoRecortado = document.createElement("canvas");
//     lienzoRecortado.width = maximoX - minimoX + 1;
//     lienzoRecortado.height = maximoY - minimoY + 1;
//     const contextoRecortado = lienzoRecortado.getContext("2d");
//     if (!contextoRecortado) {
//       throw new Error("No se pudo recortar la imagen de árboles.");
//     }

//     contextoRecortado.drawImage(
//       lienzoCompleto,
//       minimoX,
//       minimoY,
//       lienzoRecortado.width,
//       lienzoRecortado.height,
//       0,
//       0,
//       lienzoRecortado.width,
//       lienzoRecortado.height
//     );
//     return lienzoRecortado;
//   }

//   // Dibuja la parte superior y la inferior de un obstáculo dejando el hueco.
//   dibujarObstaculo(obstaculo, sueloY) {
//     // El tramo inferior comienza justo después del hueco.
//     // Ejemplo: huecoY 180 + altoHueco 150 = inicio inferior en y 330.
//     const inicioParteInferior = obstaculo.huecoY + obstaculo.altoHueco;

//     this.dibujarParteDelObstaculo(
//       obstaculo.x,
//       0,
//       obstaculo.ancho,
//       obstaculo.huecoY,
//       false
//     );
//     // Su alto llega desde el final del hueco hasta la superficie del suelo.
//     this.dibujarParteDelObstaculo(
//       obstaculo.x,
//       inicioParteInferior,
//       obstaculo.ancho,
//       sueloY - inicioParteInferior,
//       true
//     );
//   }

//   // Escala y recorta la roca; invierte la parte superior hacia el hueco.
//   dibujarParteDelObstaculo(x, y, ancho, alto, esInferior) {
//     const imagen = this.imagenObstaculo;
//     if (!imagen.complete || imagen.naturalWidth === 0 || alto <= 0) {
//       return;
//     }

//     // Escala lo suficiente para cubrir el tramo, sin deformar la imagen.
//     const escala = Math.max(
//       ancho / imagen.naturalWidth,
//       alto / imagen.naturalHeight
//     );
//     const anchoImagen = imagen.naturalWidth * escala;
//     const altoImagen = imagen.naturalHeight * escala;
//     const centroX = x + ancho / 2;
//     const contexto = this.contexto;

//     // El recorte limita la roca al rectángulo que le corresponde.
//     contexto.save();
//     contexto.beginPath();
//     contexto.rect(centroX - anchoImagen / 2, y, anchoImagen, alto);
//     contexto.clip();

//     if (esInferior) {
//       contexto.drawImage(
//         imagen,
//         centroX - anchoImagen / 2,
//         y,
//         anchoImagen,
//         altoImagen
//       );
//     } else {
//       // Invierte verticalmente la pieza superior para que apunte hacia el hueco.
//       contexto.translate(centroX, y + alto);
//       contexto.scale(1, -1);
//       contexto.drawImage(imagen, -anchoImagen / 2, 0, anchoImagen, altoImagen);
//     }

//     // Restaura el Canvas para que el recorte y la inversión no afecten otros dibujos.
//     contexto.restore();
//   }

//   // Recorta la franja de suelo y la repite sin deformar la imagen.
//   dibujarSuelo(estado) {
//     const contexto = this.contexto;
//     const inicioSuelo = estado.sueloY;
//     const imagen = this.imagenSuelo;

//     // Limita todo lo que se dibuje a la franja del suelo.
//     contexto.save();
//     contexto.beginPath();
//     contexto.rect(0, inicioSuelo, estado.ancho, estado.altoSuelo);
//     contexto.clip();

//     // Rellena transparencias para que no se vean huecos debajo de la imagen.
//     contexto.fillStyle = COLOR_BASE_SUELO;
//     contexto.fillRect(0, inicioSuelo, estado.ancho, estado.altoSuelo);

//     // La imagen se dibuja cuando termina de cargar; mientras tanto queda el respaldo.
//     if (imagen.complete && imagen.naturalWidth > 0) {
//       this.dibujarSueloRepetido(estado, inicioSuelo);
//     }

//     // Elimina el recorte antes de seguir dibujando fuera del suelo.
//     contexto.restore();
//   }

//   // Calcula el recorte, su tamaño proporcional y el desplazamiento del suelo.
//   dibujarSueloRepetido(estado, inicioSuelo) {
//     const imagen = this.imagenSuelo;
//     // Toma la parte inferior indicada por FRACCION_RECORTE_SUELO.
//     const inicioFuenteY = Math.round(
//       imagen.naturalHeight * FRACCION_RECORTE_SUELO
//     );
//     const altoFuente = imagen.naturalHeight - inicioFuenteY;
//     const altoDestino = estado.altoSuelo;
//     // Calcula el ancho según la proporción del recorte, en lugar de estirarlo.
//     // Ejemplo: un recorte de 2048 x 142 dibujado a 60 px de alto mide unos 865 px de ancho.
//     const anchoDestino = altoDestino * (imagen.naturalWidth / altoFuente);
//     // Se usan dos copias por ciclo porque las copias alternas se reflejan.
//     const periodo = anchoDestino * 2;
//     const desplazamiento = estado.desplazamientoSuelo % periodo;

//     let x = -desplazamiento;
//     let indiceCapa = 0;

//     // Sigue agregando copias hasta que todo el ancho del Canvas quede cubierto.
//     while (x < estado.ancho) {
//       this.dibujarCopiaSuelo(
//         x,
//         inicioSuelo,
//         anchoDestino,
//         altoDestino,
//         inicioFuenteY,
//         altoFuente,
//         indiceCapa
//       );
//       x += anchoDestino;
//       indiceCapa += 1;
//     }
//   }

//   // Espeja las copias alternas para disimular la unión entre repeticiones.
//   dibujarCopiaSuelo(x, y, ancho, alto, inicioFuenteY, altoFuente, indiceCapa) {
//     const contexto = this.contexto;
//     const imagen = this.imagenSuelo;

//     contexto.save();
//     if (Math.abs(indiceCapa % 2) === 1) {
//       // Las copias impares se reflejan horizontalmente para ocultar el corte.
//       contexto.translate(x + ancho, 0);
//       contexto.scale(-1, 1);
//       contexto.drawImage(
//         imagen,
//         0,
//         inicioFuenteY,
//         imagen.naturalWidth,
//         altoFuente,
//         0,
//         y,
//         ancho,
//         alto
//       );
//     } else {
//       // Las copias pares conservan la orientación original de la imagen.
//       contexto.drawImage(
//         imagen,
//         0,
//         inicioFuenteY,
//         imagen.naturalWidth,
//         altoFuente,
//         x,
//         y,
//         ancho,
//         alto
//       );
//     }
//     // Restaura la orientación normal antes de dibujar la siguiente copia.
//     contexto.restore();
//   }
// }

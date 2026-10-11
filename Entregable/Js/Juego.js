import { Rompecabezas } from "./Rompecabezas.js";
import { ControlClicks } from "./ControlClicks.js";
import { Filtros } from "./Filtros.js";

// Si el sistema pide menos animaciones, la ruleta salta directo al resultado
const reducirMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;

export class Juego {
  constructor(idCanvas, imagenes, niveles) {
    this.canvas = document.getElementById(idCanvas);
    this.ctx = this.canvas.getContext("2d");

    this.imagenes = imagenes;       // rutas del banco de imágenes
    this.niveles = niveles;
    this.nivelActual = 0;

    this.cargadas = new Map();      // ruta → imagen ya cargada
    this.imagenActual = null;       // imagen sorteada para el nivel actual
    this.ultimaImagen = -1;         // índice de la imagen del nivel anterior

    this.rompecabezas = null;
    this.controlClicks = null;
    this.filtro = null;
    this.colorFondo = { r: 0, g: 0, b: 90, a: 255 };

    // Canvas auxiliar: las piezas se dibujan acá, se filtran, y después
    // se copian al canvas real (así el filtro no afecta al fondo).
    this.canvasTemporal = document.createElement("canvas");
    this.ctxTemporal = this.canvasTemporal.getContext("2d");

    // HUD
    this.textoNivel = document.getElementById("textoNivel");
    this.btnSiguiente = document.getElementById("btnSiguiente");
    this.btnSiguiente.addEventListener("click", () => this.siguienteNivel());

    // Plantilla de carga
    this.pantallaCarga = document.getElementById("pantallaCarga");
    this.textoCarga = document.getElementById("textoCarga");
    this.spinner = document.getElementById("spinner");
    this.ruleta = document.getElementById("ruleta");
  }

  // ------------------------------------------------------------------
  //  Arranque: precarga el banco y muestra la ruleta para el nivel 1
  // ------------------------------------------------------------------
  async iniciar() {
    new ResizeObserver(() => this.ajustarTamaño()).observe(this.canvas.parentElement);
    // window.addEventListener("resize", () => this.ajustarTamaño());
    this.ajustarTamaño();

    try {
      // La plantilla ya está visible (con el spinner) mientras carga el banco
      await Promise.all(
        this.imagenes.map(async (src) => {
          this.cargadas.set(src, await this.cargarImagen(src));
        })
      );
      await this.presentarNivel();
    } catch (error) {
      this.textoCarga.textContent = error.message;
      this.spinner.hidden = true;
    }
  }

  // Devuelve una promesa que se cumple cuando la imagen terminó de cargar
  cargarImagen(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo cargar " + src));
      img.src = src;
    });
  }

  esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  //  Plantilla de carga: ruleta de miniaturas
  // Elige al azar el índice de una imagen del banco, distinta a la del nivel anterior
  sortearImagen() {
    const opciones = this.imagenes
      .map((_, i) => i)
      .filter((i) => this.imagenes.length < 2 || i !== this.ultimaImagen);
    return opciones[Math.floor(Math.random() * opciones.length)];
  }

  // Muestra la plantilla, sortea la imagen del nivel actual con la ruleta,
  // oculta la plantilla y arranca el nivel.
  // Se usa al cargar la página y cada vez que se pasa de nivel.
  async presentarNivel() {
    const indice = this.sortearImagen();
    this.ultimaImagen = indice;

    this.pantallaCarga.classList.remove("oculta");
    this.spinner.hidden = true;
    this.textoCarga.textContent = `Eligiendo la imagen del nivel ${this.nivelActual + 1}…`;

    const figuras = this.construirRuleta();
    this.ruleta.hidden = false;

    await this.correrRuleta(figuras, indice);

    this.textoCarga.textContent = "¡Listo!";
    await this.esperar(600);

    this.imagenActual = this.cargadas.get(this.imagenes[indice]);
    this.cargarNivel();
    this.pantallaCarga.classList.add("oculta");
  }

  // Arma una fila con la miniatura de cada imagen del banco
  construirRuleta() {
    const { filas, columnas } = this.niveles[this.nivelActual];

    this.ruleta.innerHTML = `
      <div class="ruleta-titulo">
        <strong>Nivel ${this.nivelActual + 1} de ${this.niveles.length}</strong>
        <span>${filas * columnas} piezas</span>
      </div>
      <div class="miniaturas"></div>`;
    const contenedor = this.ruleta.querySelector(".miniaturas");

    return this.imagenes.map((src) => {
      const figura = document.createElement("figure");
      figura.className = "mini";

      const miniatura = document.createElement("img");
      miniatura.src = src;   // ya está en caché, aparece al instante
      miniatura.alt = "";

      const nombre = document.createElement("figcaption");
      nombre.textContent = src.split("/").pop();

      figura.append(miniatura, nombre);
      contenedor.appendChild(figura);
      return figura;
    });
  }

  // Recorre las miniaturas de izquierda a derecha, frenando de a poco
  // hasta quedar justo en la imagen elegida (objetivo = su índice).
  correrRuleta(figuras, objetivo) {
    return new Promise((resolve) => {
      const marcarElegida = () => {
        figuras.forEach((f, i) => {
          f.classList.remove("activa");
          f.classList.toggle("elegida", i === objetivo);
          f.classList.toggle("descartada", i !== objetivo);
        });
      };

      if (reducirMovimiento) {
        setTimeout(() => { marcarElegida(); resolve(); }, 500);
        return;
      }

      const cantidad = figuras.length;
      const vueltas = 2 + Math.floor(Math.random() * 2);   // 2 o 3 vueltas completas
      const total = vueltas * cantidad + objetivo;         // termina justo en la elegida
      let k = 0;

      const paso = () => {
        figuras.forEach((f, i) => f.classList.toggle("activa", i === k % cantidad));

        if (k === total) {
          setTimeout(() => { marcarElegida(); resolve(); }, 350);
          return;
        }

        // Demora del recorrido
        const demora = 70 + Math.pow(k / total, 2) * 230;  // arranca rápido y va frenando
        k++;
        setTimeout(paso, demora);
      };
      setTimeout(paso, 300);
    });
  }

  elegirFiltroAleatorio() {
    const filtros = [
      (ctx, canvas) => Filtros.grises(ctx, canvas),
      (ctx, canvas) => Filtros.brillo(ctx, canvas, 50),
      (ctx, canvas) => Filtros.negativo(ctx, canvas),
    ];
    return filtros[Math.floor(Math.random() * filtros.length)];
  }

  // Arma el nivel actual con la imagen que eligió la ruleta (ya cargada)
  cargarNivel() {
    const { filas, columnas } = this.niveles[this.nivelActual];

    this.rompecabezas = new Rompecabezas(this.imagenActual, filas, columnas);
    this.rompecabezas.mezclarPiezas();

    // ControlClicks se crea UNA sola vez; después solo se le actualiza el rompecabezas
    if (!this.controlClicks) {
      this.controlClicks = new ControlClicks(
        this.canvas, this.rompecabezas, () => this.alRotar()
      );
    } else {
      this.controlClicks.rompecabezas = this.rompecabezas;
    }

    this.filtro = this.elegirFiltroAleatorio();
    this.actualizarHud(filas * columnas);
    this.canvas.style.cursor = "pointer";
    this.ajustarTamaño();
  }

  alRotar() {
    this.rompecabezas.actualizarEspacio();
    this.rompecabezas.acomodar(this.canvas.width, this.canvas.height);
    this.renderizar();

    if (this.rompecabezas.estaResuelto()) this.alResolver();
  }

  alResolver() {
    const hayOtro = this.nivelActual < this.niveles.length - 1;

    this.textoNivel.textContent = hayOtro
      ? "¡Nivel completado!"
      : "¡Ganaste! Completaste todos los niveles";
    this.btnSiguiente.textContent = hayOtro ? "Siguiente nivel" : "Jugar de nuevo";
    this.btnSiguiente.hidden = false;
    this.canvas.style.cursor = "default";
  }

  siguienteNivel() {
    this.btnSiguiente.hidden = true;
    // El % hace que después del último nivel vuelva al primero
    this.nivelActual = (this.nivelActual + 1) % this.niveles.length;
    this.presentarNivel();   // vuelve la plantilla y sortea la imagen de este nivel
  }

  actualizarHud(cantidadPiezas) {
    this.textoNivel.textContent =
      `Nivel ${this.nivelActual + 1} de ${this.niveles.length} (${cantidadPiezas} piezas)`;
    this.btnSiguiente.hidden = true;
  }

  
  //  Canvas
  ajustarTamaño() {
    const zona = this.canvas.parentElement;      // <main class="zona-canvas">
    this.canvas.width = zona.clientWidth;
    this.canvas.height = zona.clientHeight;
    this.canvasTemporal.width = this.canvas.width;
    this.canvasTemporal.height = this.canvas.height;

    this.rompecabezas?.acomodar(this.canvas.width, this.canvas.height);
    this.renderizar();
  }

  // ajustarTamaño() {
  //   this.canvas.width = window.innerWidth;
  //   this.canvas.height = window.innerHeight;
  //   this.canvasTemporal.width = this.canvas.width;
  //   this.canvasTemporal.height = this.canvas.height;

  //   this.rompecabezas?.acomodar(this.canvas.width, this.canvas.height);
  //   this.renderizar();
  // }

  renderizar() {
    this.dibujarFondo();
    if (!this.rompecabezas) return;   // todavía no hay nivel cargado

    this.ctxTemporal.clearRect(0, 0, this.canvasTemporal.width, this.canvasTemporal.height);
    this.rompecabezas.dibujar(this.ctxTemporal);

    if (this.filtro) this.filtro(this.ctxTemporal, this.canvasTemporal);

    this.ctx.drawImage(this.canvasTemporal, 0, 0);
  }

  // --- Fondo pintado píxel por píxel ---
  dibujarFondo() {
    const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    const { r, g, b, a } = this.colorFondo;

    for (let x = 0; x < imageData.width; x++) {
      for (let y = 0; y < imageData.height; y++) {
        this.setPixel(imageData, x, y, r, g, b, a);
      }
    }
    this.ctx.putImageData(imageData, 0, 0);
  }

  setPixel(imageData, x, y, r, g, b, a) {
    const index = (x + y * imageData.width) * 4;
    imageData.data[index] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
  }
}














// import { Rompecabezas } from "./Rompecabezas.js";
// import { ControlClicks } from "./ControlClicks.js";
// import { Filtros } from "./Filtros.js";

// // Clase "directora": conecta todas las demás y se ocupa del canvas.
// export class Juego {
//   constructor(idCanvas, imagenes, niveles) {
//     this.canvas = document.getElementById(idCanvas);
//     this.ctx = this.canvas.getContext("2d");
  
//     this.imagenes = imagenes;
//     this.rompecabezas = null;

//     this.colorFondo = { r: 0, g: 64, b: 128, a: 255 };

//     this.filtro = this.elegirFiltroAleatorio();
//     // Canvas auxiliar: las piezas se dibujan acá, se filtran, y recién
//     // después se copian al canvas real (así el filtro no afecta al fondo).
//     this.canvasTemporal = document.createElement("canvas");
//     this.ctxTemporal = this.canvasTemporal.getContext("2d");

//     //Manejo de niveles
//     this.niveles = niveles;
//     this.nivelActual = 0; 

//     this.textoNivel = document.getElementById("textoNivel");
//     this.btnSiguiente = document.getElementById("btnSiguiente");
//     this.btnSiguiente.addEventListener("click", () => this.siguienteNivel());
//   }

//   //elije un filtro aleatoriamente al refrescar la pagina
//   elegirFiltroAleatorio(){
//     const filtros = [
//       (ctx, canvas) => Filtros.grises(ctx, canvas),
//       (ctx, canvas) => Filtros.brillo(ctx, canvas, 50),
//       (ctx, canvas) => Filtros.negativo(ctx, canvas) 
//     ];
//     const indice = Math.floor(Math.random()*filtros.length);
//     return filtros[indice]
//   }

//   iniciar() {
    
//     const observadorDeTamaño = new ResizeObserver(() => this.ajustarTamaño());
//     observadorDeTamaño.observe(this.canvas);
//     this.ajustarTamaño();
//     this.cargarNivel();

//   }

// cargarNivel() {
//     const { filas, columnas } = this.niveles[this.nivelActual];

//     const indice = Math.floor(Math.random() * this.imagenes.length);
//     const img = new Image();

//     img.onload = () => {
//       this.rompecabezas = new Rompecabezas(img, filas, columnas);
//       this.rompecabezas.mezclarPiezas();   // si ya lo llamabas en otro lado, no lo dupliques

//       // ControlClicks se crea una sola vez; después solo se actualiza el rompecabezas
//       if (!this.controlClicks) {
//         this.controlClicks = new ControlClicks(
//           this.canvas, this.rompecabezas, () => this.alRotar()
//         );
//       } else {
//         this.controlClicks.rompecabezas = this.rompecabezas;
//       }

//       this.filtro = this.elegirFiltroAleatorio();   // opcional: filtro nuevo por nivel
//       this.actualizarHud(filas * columnas);
//       this.ajustarTamaño();
//     };
//     img.src = this.imagenes[indice];
// }

//   // cargarImagen(src){
//   //     const img = new Image();
//   //     img.onload = () =>{
//   //       this.rompecabezas = new Rompecabezas(img);
//   //       this.rompecabezas.mezclarPiezas();
//   //       new ControlClicks(this.canvas, this.rompecabezas, () => this.alRotar());
//   //       this.ajustarTamaño();
//   //     }
//   //     img.src = src;
//   // }

//   alRotar(){
//     this.rompecabezas.actualizarEspacio();
//     this.rompecabezas.acomodar(this.canvas.width, this.canvas.height);
//     this.renderizar();

//     if(this.rompecabezas.estaResuelto()) this.alResolver();
//   }
//   alResolver() {
//     const hayOtro = this.nivelActual < this.niveles.length - 1;

//     this.textoNivel.textContent = hayOtro
//       ? "¡Nivel completado!"
//       : "¡Ganaste! Completaste todos los niveles";
//     this.btnSiguiente.textContent = hayOtro ? "Siguiente nivel" : "Jugar de nuevo";
//     this.btnSiguiente.hidden = false;
//   }

//   siguienteNivel() {
//     // El % hace que después del último nivel vuelva al primero
//     this.nivelActual = (this.nivelActual + 1) % this.niveles.length;
//     this.cargarNivel();
//   }

//   actualizarHud(cantidadPiezas) {
//     this.textoNivel.textContent =
//       `Nivel ${this.nivelActual + 1} de ${this.niveles.length} (${cantidadPiezas} piezas)`;
//     this.btnSiguiente.hidden = true;
//   }



//   // Adapta el canvas a la ventana. Al cambiar el tamaño se borra, hay que redibujar.
//   ajustarTamaño() {
//      const anchoVisible = this.canvas.clientWidth;
//     const altoVisible = this.canvas.clientHeight;
 
//     // Si el canvas está oculto o todavía no tiene tamaño, no hay nada que dibujar
//     if (anchoVisible === 0 || altoVisible === 0) return;
 
//     this.canvas.width = anchoVisible;
//     this.canvas.height = altoVisible;
//     this.canvasTemporal.width = anchoVisible;
//     this.canvasTemporal.height = altoVisible;
//     this.rompecabezas?.acomodar(this.canvas.width, this.canvas.height);
//     this.renderizar();
//   }

//   renderizar() {
//     this.dibujarFondo();
//     if (!this.rompecabezas) return; // la imagen todavía no cargó

//     this.ctxTemporal.clearRect(0, 0, this.canvasTemporal.width, this.canvasTemporal.height);
//     this.rompecabezas.dibujar(this.ctxTemporal);

//     if (this.filtro) this.filtro(this.ctxTemporal, this.canvasTemporal);

//     this.ctx.drawImage(this.canvasTemporal, 0, 0);
//   }

//   // --- Fondo pintado píxel por píxel ---

//   dibujarFondo() {
//     const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
//     const { r, g, b, a } = this.colorFondo;

//     for (let x = 0; x < imageData.width; x++) {
//       for (let y = 0; y < imageData.height; y++) {
//         this.setPixel(imageData, x, y, r, g, b, a);
//       }
//     }
//     this.ctx.putImageData(imageData, 0, 0);
//   }

//   setPixel(imageData, x, y, r, g, b, a) {
//     const index = (x + y * imageData.width) * 4;
//     imageData.data[index] = r;
//     imageData.data[index + 1] = g;
//     imageData.data[index + 2] = b;
//     imageData.data[index + 3] = a;
//   }
// }
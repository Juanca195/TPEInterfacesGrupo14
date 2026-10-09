import { Rompecabezas } from "./Rompecabezas.js";
import { ControlClicks } from "./ControlClicks.js";
import { Filtros } from "./Filtros.js";

// Clase "directora": conecta todas las demás y se ocupa del canvas.
export class Juego {
  constructor(idCanvas, srcImagen) {
    this.canvas = document.getElementById(idCanvas);
    this.ctx = this.canvas.getContext("2d");
    this.srcImagen = srcImagen;

    this.img = new Image();
    this.rompecabezas = null;

    this.colorFondo = { r: 0, g: 0, b: 70, a: 255 };

    
    this.filtro = this.elegirFiltroAleatorio();

    // Canvas auxiliar: las piezas se dibujan acá, se filtran, y recién
    // después se copian al canvas real (así el filtro no afecta al fondo).
    this.canvasTemporal = document.createElement("canvas");
    this.ctxTemporal = this.canvasTemporal.getContext("2d");
  }

  //elije un filtro aleatoriamente al refrescar la pagina
  elegirFiltroAleatorio(){
    const filtros = [
      (ctx, canvas) => Filtros.grises(ctx, canvas),
      (ctx, canvas) => Filtros.brillo(ctx, canvas, 50),
      (ctx, canvas) => Filtros.negativo(ctx, canvas) 
    ];
    const indice = Math.floor(Math.random()*filtros.length);
    return filtros[indice]
  }

  iniciar() {
    this.img.onload = () => {
      this.rompecabezas = new Rompecabezas(this.img);
      new ControlClicks(this.canvas, this.rompecabezas, () => this.renderizar());
      this.ajustarTamaño();
    };
    this.img.src = this.srcImagen;

    window.addEventListener("resize", () => this.ajustarTamaño());
    this.ajustarTamaño();
  }

  // Adapta el canvas a la ventana. Al cambiar el tamaño se borra, hay que redibujar.
  ajustarTamaño() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvasTemporal.width = this.canvas.width;
    this.canvasTemporal.height = this.canvas.height;

    this.rompecabezas?.acomodar(this.canvas.width, this.canvas.height);
    this.renderizar();
  }

  renderizar() {
    this.dibujarFondo();
    if (!this.rompecabezas) return; // la imagen todavía no cargó

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
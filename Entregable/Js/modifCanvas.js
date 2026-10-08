//import { ControladorPiezas } from "./ControladorPiezas.js";


let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
const img = new Image()

  let r = 0;
  let g = 0;
  let b = 90;
  let a = 255;

  let piezas = [];  //para las piezas de las imagenes
  // let controlador;


  function drawRect(imageData, r, g, b, a) {
    for (let x = 0; x < imageData.width; x++) {
      for (let y = 0; y < imageData.height; y++) {
        setPixel(imageData, x, y, r, g, b, a);
      }
    }
  }

  function setPixel(imageData, x, y , r, g , b, a){
    let index = (x + y * imageData.width) * 4;
    imageData.data[index + 0] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;

  }
 
//Ajusta el tamaño para futuros cambio adaptandose a cada pantalla 
function ajustarTamaño(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
 
  // Al cambiar el tamaño el canvas se borra, así que hay que volver a dibujar todo.
  renderizar();
}
 
// Carga la imagen y, cuando está lista, vuelve a dibujar la escena.
function cargarImagen(src) {
  img.onload = renderizar;
  img.src = src;
}
 
// Pinta el fondo de color usando el color definido arriba (r, g, b, a).
function dibujarFondo() {
  const imageData = ctx.createImageData(canvas.width, canvas.height)
  drawRect(imageData, r, g, b, a);
  ctx.putImageData(imageData, 0, 0);
}
 
// Corta la imagen en cuatro fragmentos y los dibuja separados en el canvas.
function cortarImagen() {
  // Calcula una escala que limite la imagen al 70 % del canvas,
  // manteniendo la proporción original.
  const escala = Math.min(
    (canvas.width * 0.5) / img.naturalWidth,
    (canvas.height * 0.5) / img.naturalHeight
  );
 
  // Calcula el tamaño de la imagen ya escalada.
  const ancho = img.naturalWidth * escala;
  const alto = img.naturalHeight * escala;
 
  // Divide la imagen original en cuatro mitades.
  const mitadOrigenX = img.naturalWidth / 2;
  const mitadOrigenY = img.naturalHeight / 2;
 
  // Cada pieza ocupa la mitad del ancho y alto escalados.
  const mitadDestinoX = ancho / 2;
  const mitadDestinoY = alto / 2;
 
  // Espacio visible entre las cuatro piezas, en píxeles del canvas.
  const espacio = 20;
 
  // Calcula el inicio para centrar el conjunto con el espacio incluido.
  const inicioX = (canvas.width - ancho - espacio) / 2;
  const inicioY = (canvas.height - alto - espacio) / 2;

  //Cambio para poder rotar la imagen
  piezas = [
    {
      origenX: 0,
      origenY: 0,
      destinoX: inicioX,
      destinoY: inicioY,
      ancho: mitadDestinoX,
      alto: mitadDestinoY,
      rotacion: 0
    },

    {
      origenX: mitadOrigenX,
      origenY: 0,
      destinoX: inicioX + mitadDestinoX + espacio,
      destinoY: inicioY,
      ancho: mitadDestinoX,
      alto: mitadDestinoY,
      rotacion: 0
    },

    {
      origenX: 0,
      origenY: mitadOrigenY,
      destinoX: inicioX,
      destinoY: inicioY + mitadDestinoY + espacio,
      ancho: mitadDestinoX,
      alto: mitadDestinoY,
      rotacion: 0
    },

    {
      origenX: mitadOrigenX,
      origenY: mitadOrigenY,
      destinoX: inicioX + mitadDestinoX + espacio,
      destinoY: inicioY + mitadDestinoY + espacio,
      ancho: mitadDestinoX,
      alto: mitadDestinoY,
      rotacion: 0
    }
  ];
}

function dibujarPiezas(destinoCtx) {

  for (const pieza of piezas) {

    destinoCtx.drawImage(
      img,

      pieza.origenX,
      pieza.origenY,
      img.naturalWidth / 2,
      img.naturalHeight / 2,

      pieza.destinoX,
      pieza.destinoY,
      pieza.ancho,
      pieza.alto
    );
  }
}

// Para girar la pieza solo aplicarle el evento al click y darla un rotate()
 
function aplicarNegativo(ctx, canvas) { 
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); 
  const data = imageData.data;
 

  for (let i = 0; i < data.length; i += 4) {
     if (data[i + 3] === 0) continue;

     data[i] = 255 - data[i]; 
     data[i + 1] = 255 - data[i + 1];
     data[i + 2] = 255 - data[i + 2];
    
  }
  
  ctx.putImageData(imageData, 0, 0); 
}

//Funciona correctamente
function aplicarBrillo(ctx, canvas){
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for(let i = 0; i<data.length; i+=4){//i+4 porque un pixel esta compuesto por RGBA
    data[i] = data[i] + 100;
    data[i+ 1] = data[i + 1] + 30;
    data[i + 2 ] = data [i+2] +30;
  }
  ctx.putImageData(imageData, 0, 0);

}

function aplicarGrises(ctx, canvas){
  const imageData = ctx.getImageData(0, 0 , canvas.width, canvas.height);
  const data = imageData.data;

  for(let i = 0; i<data.length; i+=4){
    let r = data[i]; 
    let g = data[i + 1]; 
    let b = data[i + 2]; // Aplicamos la fórmula perceptual BT.601 
    let gris = 0.299 * r + 0.587 * g + 0.114 * b; // Asignamos el valor calculado a los 3 canales de color 
    
    data[i] = gris; // Rojo (R) 
    data[i + 1] = gris; // Verde (G) 
    data[i + 2] = gris; // Azul (B) 
  }
  ctx.putImageData(imageData, 0, 0);

}

 
function renderizar() {
  dibujarFondo();

  // Espera a que la imagen haya cargado antes de intentar dibujarla.
  if (!img.complete || img.naturalWidth === 0) return;

  const imagenCanvas = document.createElement("canvas");
  imagenCanvas.width = canvas.width;
  imagenCanvas.height = canvas.height;

  const imagenCtx = imagenCanvas.getContext("2d");
  if (!imagenCtx) {
    throw new Error("No se pudo crear el contexto del canvas temporal.");
  }

  cortarImagen();
  // if (!controlador) {
  // controlador = new ControladorPiezas(
  //   canvas,
  //   piezas,
  //   renderizar
  //  );
  // }


  dibujarPiezas(imagenCtx);
  aplicarGrises(imagenCtx, imagenCanvas)
  //aplicarBrillo(imagenCtx, imagenCanvas);
  //aplicarNegativo(imagenCtx, imagenCanvas);
  ctx.drawImage(imagenCanvas, 0, 0);
  
}
 
 
cargarImagen("paisaje.jpg");
ajustarTamaño();
window.addEventListener("resize", ajustarTamaño)
 




// Dibuja el fragmento superior izquierdo:
  // los primeros cuatro valores indican el recorte en la imagen original;
  // los últimos cuatro indican su posición y tamaño en el canvas.
  // destinoCtx.drawImage(
  //   img,
  //   0, 0, mitadOrigenX, mitadOrigenY,
  //   inicioX, inicioY, mitadDestinoX, mitadDestinoY
  // );
 
  // Dibuja el fragmento superior derecho, desplazado a la derecha.
  // destinoCtx.drawImage(
  //   img,
  //   mitadOrigenX, 0, mitadOrigenX, mitadOrigenY,
  //   inicioX + mitadDestinoX + espacio, inicioY,
  //   mitadDestinoX, mitadDestinoY
  // );
 
  // // Dibuja el fragmento inferior izquierdo, desplazado hacia abajo.
  // destinoCtx.drawImage(
  //   img,
  //   0, mitadOrigenY, mitadOrigenX, mitadOrigenY,
  //   inicioX, inicioY + mitadDestinoY + espacio,
  //   mitadDestinoX, mitadDestinoY
  // );
 
  // // Dibuja el fragmento inferior derecho, desplazado a la derecha y abajo.
  // destinoCtx.drawImage(
  //   img,
  //   mitadOrigenX, mitadOrigenY, mitadOrigenX, mitadOrigenY,
  //   inicioX + mitadDestinoX + espacio,
  //   inicioY + mitadDestinoY + espacio,
  //   mitadDestinoX, mitadDestinoY
  // );
 

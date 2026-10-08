
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
const img = new Image()

  let r = 0;
  let g = 0;
  let b = 90;
  let a = 255;

  

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
function cortarImagen(destinoCtx) {
  // Calcula una escala que limite la imagen al 70 % del canvas,
  // manteniendo la proporción original.
  const escala = Math.min(
    (canvas.width * 0.7) / img.naturalWidth,
    (canvas.height * 0.7) / img.naturalHeight
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
 
  // Dibuja el fragmento superior izquierdo:
  // los primeros cuatro valores indican el recorte en la imagen original;
  // los últimos cuatro indican su posición y tamaño en el canvas.
  destinoCtx.drawImage(
    img,
    0, 0, mitadOrigenX, mitadOrigenY,
    inicioX, inicioY, mitadDestinoX, mitadDestinoY
  );
 
  // Dibuja el fragmento superior derecho, desplazado a la derecha.
  destinoCtx.drawImage(
    img,
    mitadOrigenX, 0, mitadOrigenX, mitadOrigenY,
    inicioX + mitadDestinoX + espacio, inicioY,
    mitadDestinoX, mitadDestinoY
  );
 
  // Dibuja el fragmento inferior izquierdo, desplazado hacia abajo.
  destinoCtx.drawImage(
    img,
    0, mitadOrigenY, mitadOrigenX, mitadOrigenY,
    inicioX, inicioY + mitadDestinoY + espacio,
    mitadDestinoX, mitadDestinoY
  );
 
  // Dibuja el fragmento inferior derecho, desplazado a la derecha y abajo.
  destinoCtx.drawImage(
    img,
    mitadOrigenX, mitadOrigenY, mitadOrigenX, mitadOrigenY,
    inicioX + mitadDestinoX + espacio,
    inicioY + mitadDestinoY + espacio,
    mitadDestinoX, mitadDestinoY
  );
}
 
function aplicarNegativo(ctx, canvas) { // 1. Extraemos los píxeles del canvas a memoria 
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); 
  const data = imageData.data;
 
 // 2. Iteramos de 4 en 4 (cada píxel usa R, G, B, A)
  for (let i = 0; i < data.length; i += 4) {
     if (data[i + 3] === 0) continue;

     data[i] = 255 - data[i];// Invertir Rojo (R) 
     data[i + 1] = 255 - data[i + 1]; // Invertir Verde (G) 
     data[i + 2] = 255 - data[i + 2]; // Invertir Azul (B) 
    
  }
  // 3. Renderizamos la imagen invertida de vuelta en el canvas 
  ctx.putImageData(imageData, 0, 0); 
}

//Funciona correctamente
function aplicarBrillo(ctx, canvas){
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for(let i = 0; i<data.length; i+=4){
    data[i] = data[i] + 100;
    data[i+ 1] = data[i + 1] + 30;
    data[i + 2 ] = data [i+2] +30;
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

  cortarImagen(imagenCtx);
   aplicarBrillo(imagenCtx, imagenCanvas);
  //aplicarNegativo(imagenCtx, imagenCanvas);
  ctx.drawImage(imagenCanvas, 0, 0);
  
}
 
 
cargarImagen("paisaje.jpg");
ajustarTamaño();
window.addEventListener("resize", ajustarTamaño)
 
 
//  img.onload = function(){

//     canvas.width = img.width;
//     canvas.height = img.height;

//     ctx.drawImage(img, 0, 0);

//     const imageData =  ctx.getImageData(0, 0, canvas.width, canvas.height);

//     console.log(imageData)

//  }
//  img.src = 'paisaje.jpg'




// //Levanta una imagen en memoria, al cargarse.
// const img = new Image();
// img.onload = () => {
//   const canvas = document.createElement("canvas");
//   canvas.width = img.width;
//   canvas.height = img.height;
//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(img, 0, 0);
//   const pixeles = ctx.getImageData(0, 0, img.width, img.height);
// };
// img.src = "foto.jpg";
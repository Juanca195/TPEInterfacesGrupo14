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

// function Circle() {
// 	  this.posX = 4;
// 	  this.posY = 4;
// 	  this.radio = 10;
// 	  this.color = '#141444';
// 	}
	
	
// 	function Circle(paramPosX, paramPosY, paramRadio, paramColor) {
// 	  this.posX = paramPosX;
// 	  this.posY = paramPosY;
// 	  this.radio = paramRadio;
// 	  this.color = paramColor;
// 	}

// 	Circle.prototype.message = function() {
// 	  alert("I'm a Circle with Radio: " + this.radio);
// 	}

// 	var circle1 = new Circle(4,4,10,'#141444');
// 	var circle2 = new Circle(5,5,10,'#ffffff');
// 	var circle3 = new Circle(6,6,10,'#000000');
// 	var circle4 = new Circle(1,9,44,'#14ff44');
	
// 	circle1.message();
// 	.....
	
// 	Circle.prototype.draw = function(ctx) {
// 	  ctx.beginPath();
// 	  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
// 	  ctx.fillStyle = this.fill;
// 	  ctx.fill();
// 	}

/**
 * Dibuja en el Canvas el estado que recibe del juego.
 * Solo representa datos: no cambia posiciones ni aplica reglas de partida.
 */
export class Vista {
  constructor(canvas) {
    this.canvas = canvas;
    this.contexto = canvas.getContext("2d");

    if (!this.contexto) {
      throw new Error("No se pudo crear el contexto 2D del Canvas.");
    }

    this.imagenFondo = new Image();
    this.imagenFondo.src = new URL(
      "../../img/fondoParaBird.jpg",
      import.meta.url
    ).href;

    // Carga la roca transparente que se usará como obstáculo.
    this.imagenObstaculo = new Image();
    this.imagenObstaculo.src = new URL(
      "../../img/roca_obstaculo_transparente.png",
      import.meta.url
    ).href;

    // Informa si la imagen no se pudo cargar.
    this.imagenObstaculo.addEventListener("error", () => {
      console.error("No se pudo cargar roca_obstaculo_transparente.png");
    });
  }

  // Dibuja una escena completa usando una copia del estado actual.
  dibujar(estado) {
    this.dibujarFondo(estado);

    for (const obstaculo of estado.obstaculos) {
      this.dibujarObstaculo(obstaculo, estado.sueloY);
    }

    this.dibujarSuelo(estado);
  }

  // por el momento es estatico, se debe modificar en 4
  // Pinta el cielo y las nubes decorativas del fondo.
  dibujarFondo(estado) {
    const contexto = this.contexto;
    contexto.fillStyle = "#87ceeb";
    contexto.fillRect(0, 0, estado.ancho, estado.alto);

    // this.dibujarNube(80, 110);
    // this.dibujarNube(340, 205);
    // this.dibujarNube(220, 330);  
      const imagen = this.imagenFondo;

      // Usa el cielo como fondo temporal mientras se carga la imagen.
      contexto.fillStyle = "#87ceeb";
      contexto.fillRect(0, 0, estado.ancho, estado.alto);

      if (!imagen.complete || imagen.naturalWidth === 0) {
        return;
      }

      // Escala la imagen para cubrir el canvas sin deformarla.
      const escala = Math.max(
        estado.ancho / imagen.naturalWidth,
        estado.alto / imagen.naturalHeight
      );
      const ancho = imagen.naturalWidth * escala;
      const alto = imagen.naturalHeight * escala;

      // Centra la imagen; puede recortar un poco los bordes para llenar el canvas.
      contexto.drawImage(
        imagen,
        (estado.ancho - ancho) / 2,
        (estado.alto - alto) / 2,
        ancho,
        alto
      );
    
  }

  // Dibuja una nube sencilla formada por círculos superpuestos.
  dibujarNube(x, y) {
    const contexto = this.contexto;
    contexto.fillStyle = "#ffffffb8";
    contexto.beginPath();
    contexto.arc(x, y, 22, 0, Math.PI * 2);
    contexto.arc(x + 24, y - 10, 28, 0, Math.PI * 2);
    contexto.arc(x + 52, y, 21, 0, Math.PI * 2);
    contexto.fill();
  }

  // Dibuja la parte superior y la inferior de un obstáculo dejando el hueco.
  dibujarObstaculo(obstaculo, sueloY) {
    const baseDelObstaculo = obstaculo.huecoY + obstaculo.altoHueco;
    const altoParteInferior = sueloY - baseDelObstaculo;

    this.dibujarParteDelObstaculo(
      obstaculo.x,
      0,
      obstaculo.ancho,
      obstaculo.huecoY,
      false
    );
    this.dibujarParteDelObstaculo(
      obstaculo.x,
      baseDelObstaculo,
      obstaculo.ancho,
      altoParteInferior,
      true
    );
  }
// Dibuja la roca; la parte superior va invertida para que la punta apunte al hueco.
dibujarParteDelObstaculo(x, y, ancho, alto, esInferior) {
  const imagen = this.imagenObstaculo;
  if (!imagen.complete || imagen.naturalWidth === 0 || alto <= 0) {
    return;
  }

  const contexto = this.contexto;
  // Escala sin deformar y cubre todo el alto necesario.
  const escala = Math.max(
    ancho / imagen.naturalWidth,
    alto / imagen.naturalHeight
  );
  const anchoImg = imagen.naturalWidth * escala;
  const altoImg = imagen.naturalHeight * escala;
  const centroX = x + ancho / 2;

  contexto.save();
  contexto.beginPath();
  contexto.rect(centroX - anchoImg / 2, y, anchoImg, alto); // recorta lo que sobra
  contexto.clip();

  if (esInferior) {
    contexto.drawImage(imagen, centroX - anchoImg / 2, y, anchoImg, altoImg);
  } else {
    contexto.translate(centroX, y + alto);
    contexto.scale(1, -1);
    contexto.drawImage(imagen, -anchoImg / 2, 0, anchoImg, altoImg);
  }
  contexto.restore();
}


  // Tubos verdes 
  // // Dibuja una sección de obstáculo con tapa y un reflejo claro.
  // dibujarParteDelObstaculo(x, y, ancho, alto, tieneTapaArriba) {
  //   const contexto = this.contexto;
  //   const altoTapa = 22;
  //   const tapaY = tieneTapaArriba ? y : y + alto - altoTapa;

  //   contexto.fillStyle = "#42a84a";
  //   contexto.strokeStyle = "#246b31";
  //   contexto.lineWidth = 4;
  //   contexto.fillRect(x, y, ancho, alto);
  //   contexto.strokeRect(x, y, ancho, alto);

  //   contexto.fillStyle = "#63c65c";
  //   contexto.fillRect(x - 5, tapaY, ancho + 10, altoTapa);
  //   contexto.strokeRect(x - 5, tapaY, ancho + 10, altoTapa);

  //   contexto.fillStyle = "#a3e879";
  //   contexto.fillRect(
  //     x + 10,
  //     y + (tieneTapaArriba ? altoTapa : 0),
  //     8,
  //     Math.max(0, alto - altoTapa)
  //   );
  // }

  // Dibuja el suelo y sus franjas móviles.
  dibujarSuelo(estado) {
    const contexto = this.contexto;
    const inicioSuelo = estado.sueloY;

    contexto.fillStyle = "#d9a441";
    contexto.fillRect(0, inicioSuelo, estado.ancho, estado.altoSuelo);
    contexto.fillStyle = "#73bf45";
    contexto.fillRect(0, inicioSuelo, estado.ancho, 12);

    contexto.strokeStyle = "#b47d2c";
    contexto.lineWidth = 3;
    for (let x = -estado.desplazamientoSuelo; x < estado.ancho; x += 40) {
      contexto.beginPath();
      contexto.moveTo(x, inicioSuelo + 20);
      contexto.lineTo(x + 20, inicioSuelo + estado.altoSuelo);
      contexto.stroke();
    }
  }

}

/**
 * Dibuja en el Canvas el estado que recibe del juego.
 * Solo representa datos: no cambia posiciones ni aplica reglas de partida.
 */
export class Renderizador {
  constructor(canvas) {
    this.canvas = canvas;
    this.contexto = canvas.getContext("2d");

    if (!this.contexto) {
      throw new Error("No se pudo crear el contexto 2D del Canvas.");
    }

    // Resuelve la imagen desde la ubicación de este módulo, no desde otra página.
    this.imagenJugador = new Image();
    this.imagenJugador.src = new URL(
      "../../img/goku_base_vuelo_3f.png",
      import.meta.url
    ).href;
    this.imagenJugador.addEventListener("error", () => {
      console.error("No se pudo cargar img/goku_base_vuelo_3f.png; se usará el dibujo alternativo.");
    });
  }

  // Dibuja una escena completa usando una copia del estado actual.
  dibujar(estado) {
    this.dibujarFondo(estado);

    for (const obstaculo of estado.obstaculos) {
      this.dibujarObstaculo(obstaculo, estado.sueloY);
    }

    this.dibujarSuelo(estado);
    this.dibujarJugador(estado.jugador);
  }

  // Pinta el cielo y las nubes decorativas del fondo.
  dibujarFondo(estado) {
    const contexto = this.contexto;
    contexto.fillStyle = "#87ceeb";
    contexto.fillRect(0, 0, estado.ancho, estado.alto);

    this.dibujarNube(80, 110);
    this.dibujarNube(340, 205);
    this.dibujarNube(220, 330);
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

  // Dibuja una sección de obstáculo con tapa y un reflejo claro.
  dibujarParteDelObstaculo(x, y, ancho, alto, tieneTapaArriba) {
    const contexto = this.contexto;
    const altoTapa = 22;
    const tapaY = tieneTapaArriba ? y : y + alto - altoTapa;

    contexto.fillStyle = "#42a84a";
    contexto.strokeStyle = "#246b31";
    contexto.lineWidth = 4;
    contexto.fillRect(x, y, ancho, alto);
    contexto.strokeRect(x, y, ancho, alto);

    contexto.fillStyle = "#63c65c";
    contexto.fillRect(x - 5, tapaY, ancho + 10, altoTapa);
    contexto.strokeRect(x - 5, tapaY, ancho + 10, altoTapa);

    contexto.fillStyle = "#a3e879";
    contexto.fillRect(
      x + 10,
      y + (tieneTapaArriba ? altoTapa : 0),
      8,
      Math.max(0, alto - altoTapa)
    );
  }

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

  // Dibuja el cuadro actual del spritesheet o una figura alternativa.
  dibujarJugador(jugador) {
    const x = jugador.x - jugador.ancho / 2;
    const y = jugador.y - jugador.alto / 2;

    if (this.imagenJugador.complete && this.imagenJugador.naturalWidth > 0) {
      const anchoCuadro = this.imagenJugador.naturalWidth / 3;

      this.contexto.drawImage(
        this.imagenJugador,
        jugador.cuadro * anchoCuadro,
        0,
        anchoCuadro,
        this.imagenJugador.naturalHeight,
        x,
        y,
        jugador.ancho,
        jugador.alto
      );
      return;
    }

    this.dibujarJugadorAlternativo(jugador);
  }

  // Dibuja una versión simple del personaje mientras carga o si falta el sprite.
  dibujarJugadorAlternativo(jugador) {
    const contexto = this.contexto;

    contexto.fillStyle = "#f28c28";
    contexto.beginPath();
    contexto.arc(jugador.x, jugador.y, jugador.ancho / 2, 0, Math.PI * 2);
    contexto.fill();
    contexto.strokeStyle = "#8b3e12";
    contexto.lineWidth = 3;
    contexto.stroke();

    contexto.fillStyle = "#fff";
    contexto.beginPath();
    contexto.arc(jugador.x + 10, jugador.y - 7, 8, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = "#17324d";
    contexto.beginPath();
    contexto.arc(jugador.x + 12, jugador.y - 7, 3, 0, Math.PI * 2);
    contexto.fill();
    contexto.fillStyle = "#242424";
    contexto.beginPath();
    contexto.moveTo(jugador.x - 12, jugador.y - 22);
    contexto.lineTo(jugador.x - 5, jugador.y - 35);
    contexto.lineTo(jugador.x + 1, jugador.y - 20);
    contexto.fill();
  }
}

import { Jugador } from "./Jugador.js";
import { Obstaculo } from "./Obstaculo.js";

/**
 * Contiene el estado y las reglas de la partida.
 * No accede al DOM ni dibuja: solo actualiza los datos del juego.
 */
export class Juego {
  constructor(ancho, alto) {
    this.ancho = ancho;
    this.alto = alto;
    this.altoSuelo = 60;
    this.sueloY = alto - this.altoSuelo;
    this.estado = "menu";
    this.puntaje = 0;
    this.velocidadObstaculos = 190;
    this.desplazamientoSuelo = 0;
    this.jugador = new Jugador(120, alto / 2, 58, 58);
    this.obstaculos = [];
  }

  // Prepara un estado nuevo y deja la partida lista para jugar.
  iniciar() {
    this.estado = "jugando";
    this.puntaje = 0;
    this.desplazamientoSuelo = 0;
    this.jugador.reiniciar(this.alto / 2);
    this.obstaculos = [
      new Obstaculo(this.ancho + 100, this.sueloY)
    ];
  }

  // Aplica las reglas de movimiento, generación, puntaje y colisiones.
  actualizar(deltaTime) {
    if (this.estado !== "jugando") {
      return;
    }

    this.jugador.actualizar(deltaTime);
    this.desplazamientoSuelo =
      (this.desplazamientoSuelo + this.velocidadObstaculos * deltaTime) % 40;

    for (const obstaculo of this.obstaculos) {
      obstaculo.actualizar(this.velocidadObstaculos, deltaTime);
    }

    // Mantiene un obstáculo nuevo en camino cuando el último ya avanzó.
    const ultimoObstaculo = this.obstaculos[this.obstaculos.length - 1];
    if (ultimoObstaculo && ultimoObstaculo.x < this.ancho - 250) {
      this.obstaculos.push(new Obstaculo(this.ancho + 20, this.sueloY));
    }

    // Descarta los obstáculos que ya salieron de la pantalla.
    this.obstaculos = this.obstaculos.filter(
      (obstaculo) => obstaculo.x + obstaculo.ancho > 0
    );

    // Suma un punto cuando el jugador pasa por completo un obstáculo.
    for (const obstaculo of this.obstaculos) {
      if (!obstaculo.pasado && obstaculo.x + obstaculo.ancho < this.jugador.x) {
        obstaculo.pasado = true;
        this.puntaje += 1;
      }
    }

    // Una colisión con los límites o con un obstáculo termina la partida.
    if (this.colisionaConLimites() || this.colisionaConObstaculo()) {
      this.estado = "terminado";
    }
  }

  // Impulsa al jugador solo mientras una partida está en curso.
  hacerSaltar() {
    if (this.estado === "jugando") {
      this.jugador.saltar();
    }
  }

  // Devuelve una copia de los datos que la capa visual necesita dibujar.
  obtenerEstado() {
    return {
      estado: this.estado,
      puntaje: this.puntaje,
      ancho: this.ancho,
      alto: this.alto,
      sueloY: this.sueloY,
      altoSuelo: this.altoSuelo,
      desplazamientoSuelo: this.desplazamientoSuelo,
      jugador: this.jugador.obtenerEstado(),
      obstaculos: this.obstaculos.map((obstaculo) => obstaculo.obtenerEstado())
    };
  }

  // Comprueba si el jugador llegó al techo o cayó sobre el suelo.
  colisionaConLimites() {
    const jugador = this.jugador;
    const mitadAlto = jugador.alto / 2;

    return jugador.y - mitadAlto < 0
      || jugador.y + mitadAlto > this.sueloY;
  }

  // Comprueba si el jugador se cruza con la parte superior o inferior de un obstáculo.
  colisionaConObstaculo() {
    const jugador = this.jugador;
    const jugadorIzquierda = jugador.x - jugador.ancho * 0.36;
    const jugadorDerecha = jugador.x + jugador.ancho * 0.36;
    const jugadorArriba = jugador.y - jugador.alto * 0.36;
    const jugadorAbajo = jugador.y + jugador.alto * 0.36;

    return this.obstaculos.some((obstaculo) => {
      const seCruzaHorizontalmente = jugadorDerecha > obstaculo.x
        && jugadorIzquierda < obstaculo.x + obstaculo.ancho;
      const finalDelHueco = obstaculo.huecoY + obstaculo.altoHueco;
      const estaFueraDelHueco = jugadorArriba < obstaculo.huecoY
        || jugadorAbajo > finalDelHueco;

      return seCruzaHorizontalmente && estaFueraDelHueco;
    });
  }
}

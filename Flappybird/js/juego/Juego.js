import { Jugador } from "./Jugador.js";
import { Obstaculo } from "./Obstaculo.js";
import { EsferaDragon } from "./EsferaDragon.js";

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

    this.esferas = [];
    this.esferasConseguidad = new Set();
    this.ultimoPuntajeConEsferas = 0; 
  }

  // Prepara un estado nuevo y deja la partida lista para jugar.
  iniciar() {
    this.estado = "jugando";
    this.puntaje = 0;
    this.desplazamientoSuelo = 0;
    this.jugador.reiniciar(this.alto / 2);
    this.obstaculos = [];
    this.obstaculos.push(this.crearObstaculo(this.ancho + 100));
    this.esferas = [];
    this.esferasConseguidad.clear();
    this.ultimoPuntajeConEsferas = 0;
  }
  crearEsfera() {
    const numero = Math.floor(Math.random() * 7) + 1;

    const y =
      Math.random() * (this.sueloY - 150) + 50;

    this.esferas.push(
      new EsferaDragon(
        this.ancho + 50,
        y,
        numero
      )
    );
  }

  calcularAltoHueco(puntajePrevisto = this.puntaje) {
    // Cada 3 puntos previstos aumenta un nivel; cada nivel reduce el hueco 10 px.
    const nivelDificultad = Math.min(Math.floor(puntajePrevisto / 3), 10);
    // Mantiene el hueco en 75 px o más para que no se vuelva demasiado estrecho.
    return Math.max(75, 175 - nivelDificultad * 10);
  }

  crearObstaculo(x, obstaculoAnterior = null) {
    let centroHuecoAnterior = null;
    let cantidadObstaculosPendientes = 0;

    for (let i = 0; i < this.obstaculos.length; i++) {
      const obstaculoActual = this.obstaculos[i];

      if (obstaculoActual.pasado === false) {
        cantidadObstaculosPendientes += 1;
      }
    }
    const puntajePrevisto = this.puntaje + cantidadObstaculosPendientes;

    if (obstaculoAnterior !== null) {
      // Calcula el centro del hueco anterior para limitar el cambio de altura.
      centroHuecoAnterior = obstaculoAnterior.huecoY + obstaculoAnterior.altoHueco / 2;
    }

    // Anticipa los puntos de los obstáculos pendientes para que el siguiente ya cambie.
    return new Obstaculo(
      x,
      this.sueloY,
      this.calcularAltoHueco(puntajePrevisto),
      centroHuecoAnterior
    );
  }

  // Aplica las reglas de movimiento, generación, puntaje y colisiones.
  actualizar(deltaTime) {
    if (this.estado !== "jugando") {
      return;
    }

    this.jugador.actualizar(deltaTime);
    this.desplazamientoSuelo =
      this.desplazamientoSuelo + this.velocidadObstaculos * deltaTime;

    for (const obstaculo of this.obstaculos) {
      obstaculo.actualizar(this.velocidadObstaculos, deltaTime);
    }

    // Mantiene un obstáculo nuevo en camino cuando el último ya avanzó.
    const ultimoObstaculo = this.obstaculos[this.obstaculos.length - 1];
    if (ultimoObstaculo && ultimoObstaculo.x < this.ancho - 250) {
      this.obstaculos.push(this.crearObstaculo(this.ancho + 20, ultimoObstaculo));
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
      if (this.puntaje > 3 && this.esferas.length === 0) {
          this.crearEsfera();
          this.ultimoPuntajeConEsferas  = this.puntaje;
      }
      for (const esfera of this.esferas) {
      esfera.actualizar(
        this.velocidadObstaculos,
        deltaTime
        );
      }
      this.recolectarEsferas();
    // Una colisión con los límites o con un obstáculo termina la partida.
    if (this.colisionaConLimites() || this.colisionaConObstaculo()) {
      this.estado = "terminado";
    }
  }
  recolectarEsferas() {
    const jugador = this.jugador;

    const izquierda = jugador.x - jugador.ancho / 2;
    const derecha = jugador.x + jugador.ancho / 2;

    const arriba = jugador.y - jugador.alto / 2;
    const abajo = jugador.y + jugador.alto / 2;

    this.esferas = this.esferas.filter(esfera => {

      const colision =
        derecha > esfera.x &&
        izquierda < esfera.x + esfera.ancho &&
        abajo > esfera.y &&
          arriba < esfera.y + esfera.alto;

        if (colision) {
          this.esferasConseguidad.add(
            esfera.numero
          );

          return false;
        }

        return true;
      });
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
      obstaculos: this.obstaculos.map((obstaculo) => obstaculo.obtenerEstado()),

      esferas: this.esferas.map(
        esfera => esfera.obtenerEstado()
      ),
      esferasConseguidad: [
        ...this.esferasConseguidad
      ]
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

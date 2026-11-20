import { Jugador } from "./Jugador.js";
import { Obstaculo } from "./Obstaculo.js";
import { EsferaDragon } from "./EsferaDragon.js";
import { Dragon } from "./Dragon.js";

//vidas para el choque
const VIDAS_INICIALES = 3;
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
    this.esferasConseguidad = [];
    this.ultimoPuntajeConEsferas = 0; 
    this.dragones = [];
    this.tiempoHastaDragon = 5;
    this.tiempoParpadeo = 0; 
    this.vidas = VIDAS_INICIALES;
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
    this.esferasConseguidad = [];
    this.ultimoPuntajeConEsferas = 0;
    this.dragones = [];
    this.tiempoHastaDragon = 5;
    this.vidas = VIDAS_INICIALES;
    this.tiempoParpadeo = 0; 
  }
  crearEsfera(obstaculo) {
    if (this.esferasConseguidad.length >= 7) {
      return;
    }
    const numero = 2;
    const tamaño = 40;
    const margen = 10;

    // Calcula el espacio vertical disponible para la esfera.
    const espacioDisponible =
        obstaculo.altoHueco - tamaño - margen * 2;

    // Si no entra, no genera la esfera.
    if (espacioDisponible < 0) {
        return;
    }

    // Elige una posición vertical dentro del hueco.
    const yMinima = obstaculo.huecoY + margen;

    const y = yMinima +
        Math.random() * espacioDisponible;

    // Centra la esfera horizontalmente respecto al obstáculo.
    const x = obstaculo.x +
        obstaculo.ancho / 2 -
        tamaño / 2;

    this.esferas.push(
        new EsferaDragon(x, y, numero)
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
    this.tiempoParpadeo = Math.max(0, this.tiempoParpadeo - deltaTime);

    this.jugador.actualizar(deltaTime);
    this.desplazamientoSuelo =
    this.desplazamientoSuelo + this.velocidadObstaculos * deltaTime;
    // Actualiza la posición y las colisiones de los dragones.
    this.actualizarDragones(deltaTime);

    for (const obstaculo of this.obstaculos) {
      obstaculo.actualizar(this.velocidadObstaculos, deltaTime);
    }

    // Mantiene un obstáculo nuevo en camino cuando el último ya avanzó.
    const ultimoObstaculo = this.obstaculos[this.obstaculos.length - 1];
  if (ultimoObstaculo && ultimoObstaculo.x < this.ancho - 250) {
    const nuevoObstaculo = this.crearObstaculo(
        this.ancho + 20,
        ultimoObstaculo
    );

    this.obstaculos.push(nuevoObstaculo);

    // Genera una esfera cada 3 puntos, a partir de los 4.
    if (
        this.puntaje > 3 &&
        this.puntaje - this.ultimoPuntajeConEsferas >= 3
    ) {
        this.crearEsfera(nuevoObstaculo);

        this.ultimoPuntajeConEsferas = this.puntaje;
    }
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
      for (const esfera of this.esferas) {
      esfera.actualizar(
        this.velocidadObstaculos,
        deltaTime
        );
      }
      this.recolectarEsferas();

      this.esferas = this.esferas.filter(
      esfera => esfera.x + esfera.ancho > 0
      );
    // Una colisión con los límites o con un obstáculo termina la partida.
    if (this.colisionaConLimites() || this.colisionaConObstaculo()) {
      this.estado = "terminado";
    }
  }

  // Genera dragones, los mueve y aplica una penalización al tocarlos.
  actualizarDragones(deltaTime) {
    // Reduce el tiempo restante hasta el próximo dragón.
    this.tiempoHastaDragon -= deltaTime;

    // Crea un dragón cuando termina la espera.
    if (this.tiempoHastaDragon <= 0) {
      const altoDragon = 97;
      const margen = 60;
      const espacioVertical = this.sueloY - altoDragon - margen * 2;
      const y = margen + Math.random() * espacioVertical;

      // Lo inicia fuera del borde derecho, a una altura aleatoria segura.
      this.dragones.push(new Dragon(this.ancho + 40, y));

      // Programa el próximo dragón para dentro de cinco a ocho segundos.
      this.tiempoHastaDragon = 5 + Math.random() * 3;
    }

    // Mueve los dragones a la misma velocidad horizontal que el escenario.
    for (const dragon of this.dragones) {
     dragon.actualizar(this.velocidadObstaculos, deltaTime);
    }

    // Quita los dragones que ya salieron o que chocaron con el jugador.
    this.dragones = this.dragones.filter((dragon) => {
      if (this.jugadorTocaDragon(dragon)) {
        // El choque resta un punto, pero no termina la partida.
        this.puntaje = Math.max(0, this.puntaje - 1);
        this.tiempoParpadeo = 1.2;
        this.perderVida();
        return false;
      }

      // Conserva solamente los dragones que siguen en pantalla.
      return dragon.x + dragon.ancho > 0;
    });
  }
  perderVida() {
    this.vidas = Math.max(0, this.vidas - 1);

    if (this.vidas === 0) {
      this.estado = "terminado";
    }
  } 

  // Comprueba si los rectángulos del jugador y el dragón se superponen.
  jugadorTocaDragon(dragon) {
    const jugador = this.jugador;

    const jugadorIzquierda = jugador.x - jugador.ancho / 2;
    const jugadorDerecha = jugador.x + jugador.ancho / 2;
    const jugadorArriba = jugador.y - jugador.alto / 2;
    const jugadorAbajo = jugador.y + jugador.alto / 2;

    return jugadorDerecha > dragon.x
      && jugadorIzquierda < dragon.x + dragon.ancho
      && jugadorAbajo > dragon.y
      && jugadorArriba < dragon.y + dragon.alto;
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
          this.esferasConseguidad.push(esfera.numero);

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
      vidas: this.vidas,
      vidasMaximas: VIDAS_INICIALES,
      ancho: this.ancho,
      alto: this.alto,
      sueloY: this.sueloY,
      altoSuelo: this.altoSuelo,
      desplazamientoSuelo: this.desplazamientoSuelo,
      jugador: this.jugador.obtenerEstado(),
      tiempoParpadeo: this.tiempoParpadeo,
      obstaculos: this.obstaculos.map((obstaculo) => obstaculo.obtenerEstado()),

      // Entrega a la vista las posiciones de los dragones activos.
      dragones: this.dragones.map((dragon) => dragon.obtenerEstado()),
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

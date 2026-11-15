/**
 * Coordina la entrada del usuario, el ciclo de animación y las otras capas.
 * Recibe eventos y delega las reglas al juego, el dibujo al renderizador
 * y los mensajes a la interfaz.
 */
export class Controlador {
  constructor(juego, renderizador, interfaz, canvas) {
    this.juego = juego;
    this.renderizador = renderizador;
    this.interfaz = interfaz;
    this.canvas = canvas;
    this.ultimoTiempo = 0;
    this.ultimoPuntaje = 0;
  }

  // Conecta los controles del navegador y dibuja el estado inicial.
  iniciar() {
    this.interfaz.botonInicio.addEventListener("click", () => {
      this.empezarPartida();
    });
    this.canvas.addEventListener("pointerdown", (evento) => {
      this.manejarPulsacionDelCanvas(evento);
    });
    document.addEventListener("keydown", (evento) => {
      this.manejarTecla(evento);
    });

    this.renderizador.dibujar(this.juego.obtenerEstado());
  }

  // Inicia una partida nueva y programa su primer cuadro de animación.
  empezarPartida() {
    if (this.juego.estado === "jugando") {
      return;
    }

    this.juego.iniciar();
    this.ultimoTiempo = 0;
    this.ultimoPuntaje = 0;
    this.interfaz.actualizarPuntaje(0);
    this.interfaz.ocultarMensaje();
    requestAnimationFrame((tiempo) => this.actualizarCuadro(tiempo));
  }

  // Actualiza la partida, sincroniza la interfaz y dibuja el siguiente cuadro.
  actualizarCuadro(tiempo) {
    const deltaTime = this.ultimoTiempo === 0
      ? 0
      : Math.min((tiempo - this.ultimoTiempo) / 1000, 0.032);
    const estadoAnterior = this.juego.estado;

    this.ultimoTiempo = tiempo;
    this.juego.actualizar(deltaTime);

    const estadoActual = this.juego.obtenerEstado();
    if (estadoActual.puntaje !== this.ultimoPuntaje) {
      this.ultimoPuntaje = estadoActual.puntaje;
      this.interfaz.actualizarPuntaje(estadoActual.puntaje);
    }

    if (estadoAnterior === "jugando" && estadoActual.estado === "terminado") {
      this.interfaz.mostrarFinDePartida(estadoActual.puntaje);
    }

    this.renderizador.dibujar(estadoActual);

    if (estadoActual.estado === "jugando") {
      requestAnimationFrame((siguienteTiempo) => {
        this.actualizarCuadro(siguienteTiempo);
      });
    }
  }

  // Convierte un clic o toque en el Canvas en un salto del jugador.
  manejarPulsacionDelCanvas(evento) {
    evento.preventDefault();
    this.juego.hacerSaltar();
  }

  // Convierte la barra espaciadora o la flecha hacia arriba en un salto.
  manejarTecla(evento) {
    if (evento.code !== "Space" && evento.code !== "ArrowUp") {
      return;
    }

    evento.preventDefault();
    if (!evento.repeat) {
      this.juego.hacerSaltar();
    }
  }
}

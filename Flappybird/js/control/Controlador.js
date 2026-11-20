

  /**
   * Coordina la entrada del usuario, el ciclo de animación y las otras capas.
   * Recibe eventos y delega las reglas al juego, el escenario a la vista,
   * las animaciones del avatar al HTML/CSS y los mensajes a la interfaz.
   *
   * Las poses de Goku ya no se calculan a mano acá: cada estado
   * ("volando", "impulso", "choque") tiene su propia hoja de sprites y su
   * propia animación de CSS, que recorre sus cuadros sola. Este controlador
   * solo prende o apaga esas clases en el momento justo.
   */
  export class Controlador {
    constructor(juego, vista, interfaz, escenario, jugadorElemento) {
      this.juego = juego;
      this.vista = vista;
      this.interfaz = interfaz;
      this.escenario = escenario;
      this.jugadorElemento = jugadorElemento;
      this.ultimoTiempo = 0;
      this.ultimoPuntaje = 0;
      this.ultimasVidas = 0;
    }


    // Conecta los controles del navegador y dibuja el estado inicial.
    iniciar() {
      this.interfaz.botonInicio.addEventListener("click", () => {
        this.empezarPartida();
      });
      this.escenario.addEventListener("pointerdown", (evento) => {
        this.manejarPulsacionDelEscenario(evento);
      });
      document.addEventListener("keydown", (evento) => {
        this.manejarTecla(evento);
      });
      this.jugadorElemento.addEventListener("animationend", (evento) => {
        this.manejarFinDeAnimacion(evento);
      });

      // Escala el escenario para que ocupe el ancho disponible del marco.
      this.ajustarEscala();

      const estadoInicial = this.juego.obtenerEstado();
      this.ultimasVidas = estadoInicial.vidas;
      this.interfaz.actualizarVidas(estadoInicial.vidas, estadoInicial.vidasMaximas);

      // Coloca al avatar en su posición inicial antes de empezar la partida.
      this.actualizarPosicionJugador(this.juego.obtenerEstado());

      // Dibuja el escenario inicial; Goku es un elemento HTML dentro del escenario.
      this.vista.dibujar(this.juego.obtenerEstado());
    }

    // Escala todo el escenario (que tiene tamaño lógico fijo) al ancho del marco.
    ajustarEscala() {
      const marco = this.escenario.parentElement;

      const aplicarEscala = () => {
        const escala = marco.clientWidth / this.juego.ancho;
        this.escenario.style.transform = `scale(${escala})`;
        this.vista.establecerEscala(escala);
      };

      aplicarEscala();
      new ResizeObserver(aplicarEscala).observe(marco);
    }

    // Inicia una partida nueva y deja a Goku aleteando en bucle.
    empezarPartida() {
      if (this.juego.estado === "jugando") {
        return;
      }

      this.juego.iniciar();
      this.ultimoTiempo = 0;
      this.ultimoPuntaje = 0;

      // "volando" queda puesta durante toda la partida; el aleteo en bucle
      // lo hace solo la animación de CSS asociada a esa clase.
      this.jugadorElemento.classList.remove("choque", "impulso");
      this.jugadorElemento.classList.add("volando");

      const estadoNuevo = this.juego.obtenerEstado();
      this.ultimasVidas = estadoNuevo.vidas;
      this.interfaz.actualizarPuntaje(0);
      this.interfaz.actualizarVidas(estadoNuevo.vidas, estadoNuevo.vidasMaximas);this.interfaz.actualizarPuntaje(0);
      this.interfaz.ocultarMensaje();

      // Recoloca al jugador en su posición inicial.
      this.actualizarPosicionJugador(this.juego.obtenerEstado());
      requestAnimationFrame((tiempo) => this.actualizarCuadro(tiempo));
    }

    // Actualiza la partida, sincroniza la interfaz y dibuja el siguiente cuadro.
    actualizarCuadro(tiempo) {
      let tiempoTranscurridoEnSegundos = 0;

      if (this.ultimoTiempo !== 0) {
        const diferenciaEnMilisegundos = tiempo - this.ultimoTiempo;
        const diferenciaEnSegundos = diferenciaEnMilisegundos / 1000;

        if (diferenciaEnSegundos > 0.032) {
          tiempoTranscurridoEnSegundos = 0.032;
        } else {
          tiempoTranscurridoEnSegundos = diferenciaEnSegundos;
        }
      }

      const estadoAnterior = this.juego.estado;

      this.ultimoTiempo = tiempo;
      this.juego.actualizar(tiempoTranscurridoEnSegundos);

      const estadoActual = this.juego.obtenerEstado();
      this.actualizarPosicionJugador(estadoActual);

      if (estadoActual.puntaje !== this.ultimoPuntaje) {
        this.ultimoPuntaje = estadoActual.puntaje;
        this.interfaz.actualizarPuntaje(estadoActual.puntaje);
      }
      if (estadoActual.vidas !== this.ultimasVidas) {
          this.ultimasVidas = estadoActual.vidas;
          this.interfaz.actualizarVidas(estadoActual.vidas, estadoActual.vidasMaximas);
        }

      if (estadoAnterior === "jugando" && estadoActual.estado === "terminado") {
        // Deja que la animación de choque (la nube explotando) termine antes
        // de mostrar la pantalla de fin; eso pasa en manejarFinDeAnimacion.
        this.jugadorElemento.classList.remove("volando", "impulso");
        this.jugadorElemento.classList.add("choque");
      }

      this.vista.dibujar(estadoActual);

      if (estadoActual.estado === "jugando") {
        requestAnimationFrame((siguienteTiempo) => {
          this.actualizarCuadro(siguienteTiempo);
        });
      }
    }

    // Convierte un clic o toque en el escenario en un salto del jugador.
    manejarPulsacionDelEscenario(evento) {
      evento.preventDefault();
      this.aplicarImpulso();
    }

    // Convierte la barra espaciadora o la flecha hacia arriba en un salto.
    manejarTecla(evento) {
      if (evento.code !== "Space" && evento.code !== "ArrowUp") {
        return;
      }

      evento.preventDefault();
      if (!evento.repeat) {
        this.aplicarImpulso();
      }
    }

    // Aplica el salto del modelo y reinicia la animación de impulso
    // (la estela de fuego creciendo), para que responda a cada toque.
    aplicarImpulso() {
      if (this.juego.estado !== "jugando") {
        return;
      }

      this.juego.hacerSaltar();

      // Quitar y volver a poner la clase reinicia su animación de CSS,
      // incluso si la del toque anterior todavía no había terminado.
      this.jugadorElemento.classList.remove("impulso");
      void this.jugadorElemento.offsetWidth;
      this.jugadorElemento.classList.add("impulso");
    }

    // Sincroniza posición y tamaño del avatar con el escenario.
    // Goku vive dentro del escenario, que se escala completo, así que
    // las coordenadas del juego se usan tal cual, sin factor de escala.
    actualizarPosicionJugador(estado) {
      const jugador = estado.jugador;

      this.jugadorElemento.style.left = `${jugador.x}px`;
      this.jugadorElemento.style.top = `${jugador.y}px`;
      this.jugadorElemento.style.width = `${jugador.ancho * 1.3}px`;
      this.parpadearJugador(estado);
    }
    // Hace titilar a Goku mientras dura el parpadeo tras tocar un dragón.
  parpadearJugador(estado) {
    const parpadeando = estado.estado === "jugando" && estado.tiempoParpadeo > 0;

    // Alterna visible / semitransparente cada 0,1 segundos.
    const visible = !parpadeando || Math.floor(estado.tiempoParpadeo * 10) % 2 === 0;

    this.jugadorElemento.style.opacity = visible ? "1" : "0.25";
  }

    // Cuando termina el impulso vuelve al vuelo en bucle; cuando termina
    // la explosión del choque, recién ahí se muestra la pantalla de fin.
    manejarFinDeAnimacion(evento) {
      if (evento.animationName === "impulso-despegue") {
        this.jugadorElemento.classList.remove("impulso");
        return;
      }

      if (evento.animationName === "choque-explosion" && this.juego.estado === "terminado") {
        this.jugadorElemento.classList.remove("choque");

        const estado = this.juego.obtenerEstado();

        this.interfaz.mostrarFinDePartida(
          estado.puntaje,
          estado.esferasConseguidad
        );
      }
    }
  }
 
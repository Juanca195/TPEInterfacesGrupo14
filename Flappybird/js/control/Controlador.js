

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

    this.interfaz.actualizarPuntaje(0);
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
/**
 * Coordina la entrada del usuario, el ciclo de animación y las otras capas.
 * Recibe eventos y delega las reglas al juego, el escenario a la vista,
 * las animaciones del avatar al HTML/CSS y los mensajes a la interfaz.
 */
/* export class Controlador {
  constructor(juego, vista, interfaz, escenario, jugadorElemento) {
    this.juego = juego;
    this.vista = vista;
    this.interfaz = interfaz;
    this.escenario = escenario;
    this.jugadorElemento = jugadorElemento;
    // Guarda las dos capas que se alternan para fundir las poses del personaje.
    this.capasSprite = Array.from(
      jugadorElemento.querySelectorAll(".jugador__sprite")
    );

    // Falla claramente si el HTML no contiene las dos capas que necesita el fundido.
    if (this.capasSprite.length !== 2) {
      throw new Error("El jugador necesita exactamente dos capas de spritesheet.");
    }

    // Registra el cuadro actual y qué capa está mostrando ese cuadro.
    this.cuadroActual = 0;
    this.capaVisible = 0;
    this.ultimoTiempo = 0;
    this.ultimoPuntaje = 0;
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

    // Coloca al avatar en su posición inicial antes de empezar la partida.
    this.actualizarPosicionJugador(this.juego.obtenerEstado());

    // Dibuja el escenario inicial; Goku es un elemento HTML dentro del escenario.
    this.vista.dibujar(this.juego.obtenerEstado());
  }

  // Escala todo el escenario (que tiene tamaño lógico fijo) al ancho del marco.
  // Reemplaza el "width: 100%" que antes usaba el Canvas.
  ajustarEscala() {
    const marco = this.escenario.parentElement;

    const aplicarEscala = () => {
      const escala = marco.clientWidth / this.juego.ancho;
      this.escenario.style.transform = `scale(${escala})`;
    };

    aplicarEscala();
    new ResizeObserver(aplicarEscala).observe(marco);
  }

  // Inicia una partida nueva y programa su primer cuadro de animación.
  empezarPartida() {
    if (this.juego.estado === "jugando") {
      return;
    }

    this.juego.iniciar();
    this.ultimoTiempo = 0;
    this.ultimoPuntaje = 0;
    this.jugadorElemento.classList.remove("choque", "impulso");
    this.jugadorElemento.classList.add("volando");

    // Reinicia el cuadro y deja visible solo la primera capa al comenzar de nuevo.
    this.cuadroActual = 0;
    this.capaVisible = 0;

    for (let indiceCapa = 0; indiceCapa < this.capasSprite.length; indiceCapa++) {
      const capaSprite = this.capasSprite[indiceCapa];
      capaSprite.style.backgroundPosition = "0% 50%";

      if (indiceCapa === this.capaVisible) {
        capaSprite.classList.add("visible");
      } else {
        capaSprite.classList.remove("visible");
      }
    }

    this.interfaz.actualizarPuntaje(0);
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

    if (estadoAnterior === "jugando" && estadoActual.estado === "terminado") {
      // Detiene el aleteo y deja que la animación de choque termine primero.
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

  // Aplica el salto del modelo y reinicia la animación CSS del impulso.
  aplicarImpulso() {
    if (this.juego.estado !== "jugando") {
      return;
    }

    this.juego.hacerSaltar();

    // Avanza una pose y vuelve a la primera después de la sexta.
    this.cuadroActual = (this.cuadroActual + 1) % 6;

    // Calcula la posición horizontal de la pose dentro de la fila de seis cuadros.
    const posicionX = (this.cuadroActual / 5) * 100;

    // Actualiza la capa que está oculta antes de hacerla visible.
    const capaAnterior = this.capasSprite[this.capaVisible];
    const siguienteCapaIndice = 1 - this.capaVisible;
    const siguienteCapa = this.capasSprite[siguienteCapaIndice];
    siguienteCapa.style.backgroundPosition = `${posicionX}% 50%`;
    siguienteCapa.classList.add("visible");
    capaAnterior.classList.remove("visible");
    this.capaVisible = siguienteCapaIndice;

    // Reinicia la animación del impulso para que responda a cada toque.
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
  }

  // Limpia las animaciones de impulso y muestra el fin al terminar el choque.
  manejarFinDeAnimacion(evento) {
    if (evento.animationName === "impulso") {
      this.jugadorElemento.classList.remove("impulso");
      return;
    }

    if (evento.animationName === "choque" && this.juego.estado === "terminado") {
      this.jugadorElemento.classList.remove("choque");

      const estado = this.juego.obtenerEstado();

      this.interfaz.mostrarFinDePartida(
        estado.puntaje,
        estado.esferasConseguidad
      );
    }
  }
} */



// /**
//  * Coordina la entrada del usuario, el ciclo de animación y las otras capas.
//  * Recibe eventos y delega las reglas al juego, el escenario a la vista,
//  * las animaciones del avatar al HTML/CSS y los mensajes a la interfaz.
//  */
// export class Controlador {
//   constructor(juego, vista, interfaz, canvas, jugadorElemento) {
//     this.juego = juego;
//     this.vista = vista;
//     this.interfaz = interfaz;
//     this.canvas = canvas;
//     this.jugadorElemento = jugadorElemento;
//     // Guarda las dos capas que se alternan para fundir las poses del personaje.
//     this.capasSprite = Array.from(
//       jugadorElemento.querySelectorAll(".jugador__sprite")
//     );

//     // Falla claramente si el HTML no contiene las dos capas que necesita el fundido.
//     if (this.capasSprite.length !== 2) {
//       throw new Error("El jugador necesita exactamente dos capas de spritesheet.");
//     }

//     // Registra el cuadro actual y qué capa está mostrando ese cuadro.
//     this.cuadroActual = 0;
//     this.capaVisible = 0;
//     this.ultimoTiempo = 0;
//     this.ultimoPuntaje = 0;
//   }

//   // Conecta los controles del navegador y dibuja el estado inicial.
//   iniciar() {
//     this.interfaz.botonInicio.addEventListener("click", () => {
//       this.empezarPartida();
//     });
//     this.canvas.addEventListener("pointerdown", (evento) => {
//       this.manejarPulsacionDelCanvas(evento);
//     });
//     document.addEventListener("keydown", (evento) => {
//       this.manejarTecla(evento);
//     });
//     this.jugadorElemento.addEventListener("animationend", (evento) => {
//       this.manejarFinDeAnimacion(evento);
//     });

//     // Coloca al avatar en su posición inicial antes de empezar la partida.
//     this.actualizarPosicionJugador(this.juego.obtenerEstado());

//     // Dibuja el escenario inicial; Goku se representa como una capa HTML aparte.
//     this.vista.dibujar(this.juego.obtenerEstado());
//   }

//   // Inicia una partida nueva y programa su primer cuadro de animación.
//   empezarPartida() {
//     if (this.juego.estado === "jugando") {
//       return;
//     }

//     this.juego.iniciar();
//     this.ultimoTiempo = 0;
//     this.ultimoPuntaje = 0;
//     this.jugadorElemento.classList.remove("choque", "impulso");
//     this.jugadorElemento.classList.add("volando");

//     // Reinicia el cuadro y deja visible solo la primera capa al comenzar de nuevo.
//     this.cuadroActual = 0;
//     this.capaVisible = 0;

//     for (let indiceCapa = 0; indiceCapa < this.capasSprite.length; indiceCapa++) {

//       const capaSprite = this.capasSprite[indiceCapa];
//       capaSprite.style.backgroundPosition = "0% 50%";

//       if (indiceCapa === this.capaVisible) {
//         capaSprite.classList.add("visible");
//       } else {
//         capaSprite.classList.remove("visible");
//       }
//     }

//     this.interfaz.actualizarPuntaje(0);
//     this.interfaz.ocultarMensaje();

//     // Recoloca al jugador y actualiza la escala para el tamaño visible del Canvas.
//     this.actualizarPosicionJugador(this.juego.obtenerEstado());
//     requestAnimationFrame((tiempo) => this.actualizarCuadro(tiempo));
//   }

//   // Actualiza la partida, sincroniza la interfaz y dibuja el siguiente cuadro.
//   actualizarCuadro(tiempo) {
//     let tiempoTranscurridoEnSegundos = 0;

//     if (this.ultimoTiempo !== 0) {
//       const diferenciaEnMilisegundos = tiempo - this.ultimoTiempo;
//       const diferenciaEnSegundos = diferenciaEnMilisegundos / 1000;

//       if (diferenciaEnSegundos > 0.032) {
//         tiempoTranscurridoEnSegundos = 0.032;
//       } else {
//         tiempoTranscurridoEnSegundos = diferenciaEnSegundos;
//       }
//     }

//     const estadoAnterior = this.juego.estado;

//     this.ultimoTiempo = tiempo;
//     this.juego.actualizar(tiempoTranscurridoEnSegundos);

//     const estadoActual = this.juego.obtenerEstado();
//     this.actualizarPosicionJugador(estadoActual);

//     if (estadoActual.puntaje !== this.ultimoPuntaje) {
//       this.ultimoPuntaje = estadoActual.puntaje;
//       this.interfaz.actualizarPuntaje(estadoActual.puntaje);
//     }

//     if (estadoAnterior === "jugando" && estadoActual.estado === "terminado") {
//       // Detiene el aleteo y deja que la animación de choque termine primero.
//       this.jugadorElemento.classList.remove("volando", "impulso");
//       this.jugadorElemento.classList.add("choque");
//     }

//     this.vista.dibujar(estadoActual);

//     if (estadoActual.estado === "jugando") {
//       requestAnimationFrame((siguienteTiempo) => {
//         this.actualizarCuadro(siguienteTiempo);
//       });
//     }
//   }

//   // Convierte un clic o toque en el Canvas en un salto del jugador.
//   manejarPulsacionDelCanvas(evento) {
//     evento.preventDefault();
//     this.aplicarImpulso();
//   }

//   // Convierte la barra espaciadora o la flecha hacia arriba en un salto.
//   manejarTecla(evento) {
//     if (evento.code !== "Space" && evento.code !== "ArrowUp") {
//       return;
//     }

//     evento.preventDefault();
//     if (!evento.repeat) {
//       this.aplicarImpulso();
//     }
//   }

//   // Aplica el salto del modelo y reinicia la animación CSS del impulso.
//   aplicarImpulso() {
//     if (this.juego.estado !== "jugando") {
//       return;
//     }

//     this.juego.hacerSaltar();

//     // Avanza una pose y vuelve a la primera después de la sexta.
//     this.cuadroActual = (this.cuadroActual + 1) % 6;

//     // Calcula la posición horizontal de la pose dentro de la fila de seis cuadros.
//     const posicionX = (this.cuadroActual / 5) * 100;

//     // Actualiza la capa que está oculta antes de hacerla visible.
//     const capaAnterior = this.capasSprite[this.capaVisible];
//     const siguienteCapaIndice = 1 - this.capaVisible;
//     const siguienteCapa = this.capasSprite[siguienteCapaIndice];
//     siguienteCapa.style.backgroundPosition = `${posicionX}% 50%`;
//     siguienteCapa.classList.add("visible");
//     capaAnterior.classList.remove("visible");
//     this.capaVisible = siguienteCapaIndice;

//     // Reinicia la animación del impulso para que responda a cada toque.
//     this.jugadorElemento.classList.remove("impulso");
//     void this.jugadorElemento.offsetWidth;
//     this.jugadorElemento.classList.add("impulso");
//   }

//   // Sincroniza posición y tamaño del avatar con el Canvas, incluso si este escala.
//   actualizarPosicionJugador(estado) {
//     const escalaX = this.canvas.clientWidth / estado.ancho;
//     const escalaY = this.canvas.clientHeight / estado.alto;
//     const jugador = estado.jugador;

//     this.jugadorElemento.style.left = `${jugador.x * escalaX}px`;
//     this.jugadorElemento.style.top = `${jugador.y * escalaY}px`;
//     this.jugadorElemento.style.width = `${jugador.ancho * escalaX * 1.3}px`;
//   }

//   // Limpia las animaciones de impulso y muestra el fin al terminar el choque.
  
// manejarFinDeAnimacion(evento) {
//     if (evento.animationName === "impulso") {
//       this.jugadorElemento.classList.remove("impulso");
//       return;
//     }

//     if (evento.animationName === "choque" && this.juego.estado === "terminado") {
//       this.jugadorElemento.classList.remove("choque");

//       const estado = this.juego.obtenerEstado();

//       this.interfaz.mostrarFinDePartida(
//         estado.puntaje,
//         estado.esferasConseguidad
//       );
//     }
// }

// }

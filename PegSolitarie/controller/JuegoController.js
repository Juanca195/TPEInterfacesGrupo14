// ===================================================
// CONTROLLER: Juego
// Orquesta todo: selección de ficha, drag and drop,
// validación de movimientos, timer, fin del juego.
// ===================================================
export class Juego {
  constructor(tablero, vistaTablero, vistaMenu, vistaTemporizador, temporizador) {
    this.tablero = tablero;
    this.vistaTablero = vistaTablero;
    this.vistaMenu = vistaMenu;
    this.vistaTemporizador = vistaTemporizador;
    this.temporizador = temporizador;

    this.fichaElegida = null;
    this.estadoDelJuego = "SELECCIONANDO_FICHA"; // "EN_PARTIDA", "FINALIZADO"

    // Estado del drag and drop (req. 3 y 6)
    this.pozoEnArrastre = null;       // { fila, columna } del pozo que se está moviendo
    this.estaArrastrando = false;
    this.posicionActualMouseX = 0;
    this.posicionActualMouseY = 0;
    this.movimientosPosiblesActuales = []; // para dibujar los hints
  }

  iniciar() {
    this.estadoDelJuego = "SELECCIONANDO_FICHA";


    this.vistaMenu.mostrarSelectorDeFicha((ficha) => {
      this.elegirFicha(ficha).catch((error) => {
        console.error("No se pudo iniciar la partida:", error);
      });
    });

    this.mostrarMensajeSeleccion().catch((error) => {
      console.error("No se pudo mostrar la selección de ficha:", error);
    });
  }

  async elegirFicha(ficha) {
    this.vistaMenu.ocultar();
    this.fichaElegida = ficha;

    const imagenFondo = this.vistaTablero.imagenFondo;
    const fondoCargado = new Promise((resolve, reject) => {
      if (imagenFondo.complete) {
        if (imagenFondo.naturalWidth > 0) {
          resolve();
        } else {
          reject(new Error("No se pudo cargar la imagen de fondo."));
        }
        return;
      }

      imagenFondo.addEventListener("load", resolve, { once: true });
      imagenFondo.addEventListener(
        "error",
        () => reject(new Error("No se pudo cargar la imagen de fondo.")),
        { once: true }
      );
    });

    await Promise.all([ficha.cargarImagen(), fondoCargado]);

    // Para mostrar que gano perfectamente
    //  this.tablero.prepararVictoriaPerfecta();
    this.tablero.inicializar();
    this.estadoDelJuego = "EN_PARTIDA";

    this.vistaTemporizador.actualizar(this.temporizador.segundosRestantes);
    this.temporizador.iniciar();

    this.vistaTablero.dibujarTableroCompleto(
      this.tablero,
      this.fichaElegida,
      null,
      null
    );
  }

  async mostrarMensajeSeleccion(SELECCION_DE_FICHA) {
    const imagenFondo = this.vistaTablero.imagenFondo;

    if (!imagenFondo.complete) {
      await new Promise((resolve, reject) => {
        imagenFondo.addEventListener("load", resolve, { once: true });
        imagenFondo.addEventListener(
          "error",
          () => reject(new Error("No se pudo cargar la imagen de fondo.")),
          { once: true }
        );
      });
    }

    if (imagenFondo.naturalWidth === 0) {
      throw new Error("No se pudo cargar la imagen de fondo.");
    }

    this.vistaTablero.dibujarFondo();
    this.vistaTablero.mostrarMensajeFinDeJuego("SELECCION_DE_FICHA");
  }

  manejarMouseDown(posXClic, posYClic) {
    // Si el estado no es "EN_PARTIDA", ignora
    // Convierte el clic a fila/columna
    // Si ese pozo tiene ficha: marca pozoEnArrastre, estaArrastrando = true,
    //   y calcula movimientosPosiblesActuales con tablero.obtenerMovimientosPosiblesDesde()
    //   para mostrar los hints animados
    if (this.estadoDelJuego !== "EN_PARTIDA") {
      return;
    }

    const canvas = this.vistaTablero.canvas;
    const rect = canvas.getBoundingClientRect();

    // Convierte las coordenadas recibidas al tamaño interno del canvas.
    const xCanvas = posXClic * (canvas.width / rect.width);
    const yCanvas = posYClic * (canvas.height / rect.height);

    const anchoTablero = this.tablero.matriz[0].length * this.vistaTablero.anchoCelda;
    const altoTablero = this.tablero.matriz.length * this.vistaTablero.altoCelda;

    // El tablero está centrado; quitamos ese desplazamiento para ubicar la celda.
    const xTablero = xCanvas - (canvas.width - anchoTablero) / 2;
    const yTablero = yCanvas - (canvas.height - altoTablero) / 2;

    if (
      xTablero < 0 ||
      yTablero < 0 ||
      xTablero >= anchoTablero ||
      yTablero >= altoTablero
    ) {
      return;
    }

    const columna = Math.floor(xTablero / this.vistaTablero.anchoCelda);
    const fila = Math.floor(yTablero / this.vistaTablero.altoCelda);

    // Solo se puede empezar a arrastrar desde un pozo ocupado.
    if (this.tablero.matriz[fila][columna] !== 1) {
      return;
    }

    this.pozoEnArrastre = {
      fila,
      columna,
      x: xTablero,
      y: yTablero,
    };

    this.estaArrastrando = true;
    this.posicionActualMouseX = xTablero;
    this.posicionActualMouseY = yTablero;
    this.movimientosPosiblesActuales =
      this.tablero.obtenerMovimientosPosiblesDesde(fila, columna);


    this.vistaTablero.dibujarTableroCompleto(
      this.tablero,
      this.fichaElegida,
      this.pozoEnArrastre,
      { x: xTablero, y: yTablero },
      this.movimientosPosiblesActuales,
      performance.now()
    );


    // Permite los hints animados mientras se mantiene arrastrada la ficha.
    if (this.movimientosPosiblesActuales.length > 0) {
      requestAnimationFrame((timestamp) => this.bucleDeAnimacion(timestamp));
    }
  }

  manejarMouseMove(posXActualMouse, posYActualMouse) {
    // Si no estamos arrastrando una ficha, no hay nada que actualizar.
    if (!this.estaArrastrando || !this.pozoEnArrastre) {
      return;
    }


    const canvas = this.vistaTablero.canvas;
    const rect = canvas.getBoundingClientRect();

    // Ajustamos la posición del mouse al tamaño interno del canvas.
    const xCanvas = posXActualMouse * (canvas.width / rect.width);
    const yCanvas = posYActualMouse * (canvas.height / rect.height);

    const anchoTablero =
      this.tablero.matriz[0].length * this.vistaTablero.anchoCelda;
    const altoTablero =
      this.tablero.matriz.length * this.vistaTablero.altoCelda;

    // Quitamos el espacio que se agregó al centrar el tablero.
    const desplazamientoX = (canvas.width - anchoTablero) / 2;
    const desplazamientoY = (canvas.height - altoTablero) / 2;

    // Guardamos la posición del mouse relativa al tablero.
    this.posicionActualMouseX = xCanvas - desplazamientoX;
    this.posicionActualMouseY = yCanvas - desplazamientoY;

    // La vista usa estas coordenadas para dibujar la ficha debajo del mouse.
    this.pozoEnArrastre.x = this.posicionActualMouseX;
    this.pozoEnArrastre.y = this.posicionActualMouseY;

    // Redibujamos el tablero y las pistas de movimiento.
    this.vistaTablero.dibujarTableroCompleto(
      this.tablero,
      this.fichaElegida,
      this.pozoEnArrastre,
      { x: this.posicionActualMouseX, y: this.posicionActualMouseY },
      this.movimientosPosiblesActuales,
      performance.now()
    );


  }

  manejarMouseUp(posXSoltar, posYSoltar) {
    // Si no había una ficha en arrastre, no hay movimiento que procesar.
    if (!this.estaArrastrando || !this.pozoEnArrastre) {
      return;
    }

    const canvas = this.vistaTablero.canvas;
    const rect = canvas.getBoundingClientRect();

    // Convertimos el punto de suelta al tamaño interno del canvas.
    const xCanvas = posXSoltar * (canvas.width / rect.width);
    const yCanvas = posYSoltar * (canvas.height / rect.height);

    const anchoTablero =
      this.tablero.matriz[0].length * this.vistaTablero.anchoCelda;
    const altoTablero =
      this.tablero.matriz.length * this.vistaTablero.altoCelda;

    // Quitamos el desplazamiento del centrado para calcular fila y columna.
    const desplazamientoX = (canvas.width - anchoTablero) / 2;
    const desplazamientoY = (canvas.height - altoTablero) / 2;
    const xTablero = xCanvas - desplazamientoX;
    const yTablero = yCanvas - desplazamientoY;

    // Me permite controlar si se realizo un movimiento valido o no, para verificar si el juego termino
    let movimientoRealizado = false;

    // Si se soltó fuera de los límites de la grilla, no aplicamos el movimiento.
    if (
      xTablero >= 0 &&
      yTablero >= 0 &&
      xTablero < anchoTablero &&
      yTablero < altoTablero
    ) {
      const columnaDestino = Math.floor(
        xTablero / this.vistaTablero.anchoCelda
      );
      const filaDestino = Math.floor(
        yTablero / this.vistaTablero.altoCelda
      );

      const filaOrigen = this.pozoEnArrastre.fila;
      const columnaOrigen = this.pozoEnArrastre.columna;

      // Solo movemos la ficha si el modelo valida el salto.
      if (
        this.tablero.esMovimientoValido(
          filaOrigen,
          columnaOrigen,
          filaDestino,
          columnaDestino
        )
      ) {
        this.tablero.moverFicha(filaOrigen, columnaOrigen, filaDestino, columnaDestino);
        movimientoRealizado = true; // Hubo movimiento valido.
      }

    }

    // Limpiamos el estado del arrastre, tanto si el movimiento fue válido como si no.
    this.pozoEnArrastre = null;
    this.estaArrastrando = false;
    this.movimientosPosiblesActuales = [];

    // Redibujamos: si el movimiento no fue válido, la ficha vuelve a su lugar.
    this.vistaTablero.dibujarTableroCompleto(
      this.tablero,
      this.fichaElegida,
      null,
      null
    );

    if (movimientoRealizado) { // Avisamos si no hay más movimientos posibles, para que el juego termine.
      this.verificarFinDeJuego();
    }

  }


  verificarFinDeJuego() {
    // Consulta tablero.obtenerEstadoDelJuego()
    // Si no es "EN_JUEGO": detiene el temporizador,
    //   cambia estadoDelJuego a "FINALIZADO",
    //   muestra el mensaje correspondiente
    const estado = this.tablero.obtenerEstadoDelJuego();
    if (estado === "EN_JUEGO") {
      return;
    }
    this.estadoDelJuego = "FINALIZADO";
    this.temporizador.detener();
    this.vistaTablero.mostrarMensajeFinDeJuego(estado);

  }

  alAgotarseElTiempo() {
     if (this.estadoDelJuego !== "EN_PARTIDA") {
      return;
      }

      this.estadoDelJuego = "FINALIZADO";
      this.temporizador.detener();
      this.vistaTablero.mostrarMensajeFinDeJuego("TIMEOUT");
  }

  reiniciarPartida() {
    this.temporizador.detener();
    this.temporizador.reiniciar();

    this.estadoDelJuego = "SELECCIONANDO_FICHA";
    this.fichaElegida = null;
    this.pozoEnArrastre = null;
    this.estaArrastrando = false;
    this.movimientosPosiblesActuales = [];

    this.vistaMenu.mostrarSelectorDeFicha((ficha) => {
      this.elegirFicha(ficha).catch((error) => {
        console.error("No se pudo iniciar la partida:", error);
      });
    });

    this.mostrarMensajeSeleccion().catch((error) => {
      console.error("No se pudo mostrar la selección de ficha:", error);
    });
  }

  // Bucle de animación para los hints de movimientos posibles
  // Se le pasa el timestamp que da requestAnimationFrame y se llama asi misma mientras se este arrastrando una ficha y haya movimientos posibles
  bucleDeAnimacion(timestamp) {
    if (!this.estaArrastrando || this.movimientosPosiblesActuales.length === 0) {
      return;
    }

    this.vistaTablero.dibujarTableroCompleto(
      this.tablero,
      this.fichaElegida,
      this.pozoEnArrastre,
      { x: this.posicionActualMouseX, y: this.posicionActualMouseY },
      this.movimientosPosiblesActuales,
      timestamp
    );

    requestAnimationFrame((nuevoTimestamp) =>
      this.bucleDeAnimacion(nuevoTimestamp)
    );
  }
}
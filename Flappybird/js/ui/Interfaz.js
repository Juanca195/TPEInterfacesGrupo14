/**
 * Actualiza los textos y la pantalla superpuesta del HTML.
 * No conoce la física, las colisiones ni el contexto del Canvas.
 */
export class Interfaz {
  constructor(marcador, pantalla, titulo, texto, botonInicio) {
    this.marcador = marcador;
    this.pantalla = pantalla;
    this.titulo = titulo;
    this.texto = texto;
    this.botonInicio = botonInicio;
  }

  // Actualiza el puntaje visible para el usuario.
  actualizarPuntaje(puntaje) {
    this.marcador.textContent = `Puntaje: ${puntaje}`;
  }

  // Oculta el mensaje superpuesto al iniciar una partida.
  ocultarMensaje() {
    this.pantalla.hidden = true;
  }

  // Muestra el resultado y habilita el botón para volver a jugar.
  mostrarFinDePartida(puntaje) {
    this.titulo.textContent = "¡Fin del juego!";
    this.texto.textContent =
      `Tu puntaje fue ${puntaje}. ¿Querés intentarlo otra vez?`;
    this.botonInicio.textContent = "Volver a jugar";
    this.pantalla.hidden = false;
  }
}

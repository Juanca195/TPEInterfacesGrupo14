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
  mostrarFinDePartida(puntaje, esferasConseguidas) {
    this.titulo.textContent = "¡Fin del juego!";

    let textoEsferas = "";

    for (let numero = 1; numero <= 7; numero++) {
      if (esferasConseguidas.includes(numero)) {
        textoEsferas += "⭐ ";
      } else {
        textoEsferas += "⚫ ";
      }
    }

    this.texto.textContent =
      `Tu puntaje fue ${puntaje}.\n` +
      `Esferas recolectadas: ${esferasConseguidas.length}/7\n` +
      `${textoEsferas}`;

    this.botonInicio.textContent = "Volver a jugar";
    this.pantalla.hidden = false;
  }
}

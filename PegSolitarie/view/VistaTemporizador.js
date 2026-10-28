export class VistaTemporizador {
  constructor(elementoHTML) {
    this.elementoHTML = elementoHTML;
  }

  actualizar(segundosRestantes) {
    // Formatea y muestra el tiempo (ej: "02:45")
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;

    // agregamos un 0 adelante ya que al ser dos digitos, si el numero es menor a 10 
    // (por ejemplo, 5 segundos se tiene que ver "05", no "5")
    const minutosTexto = String(minutos).padStart(2, "0");
    const segundosTexto = String(segundos).padStart(2, "0");

    this.elementoHTML.innerText = `${minutosTexto}:${segundosTexto}`;

  }
}
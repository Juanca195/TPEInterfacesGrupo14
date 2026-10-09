
export class Filtros{
    static negativo(ctx, canvas) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
 
    for (let i = 0; i < data.length; i += 4) {
 
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    ctx.putImageData(imageData, 0, 0);
  }
 
  // valor positivo = más brillo, negativo = más oscuro
  static brillo(ctx, canvas, valor = 50) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
 
    for (let i = 0; i < data.length; i += 4) {
      data[i] += valor;     // Uint8ClampedArray recorta solo a 0-255
      data[i + 1] += valor;
      data[i + 2] += valor;
    }
    ctx.putImageData(imageData, 0, 0);
  }
 
  static grises(ctx, canvas) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
 
    for (let i = 0; i < data.length; i += 4) {
      // Fórmula perceptual BT.601
      const gris = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
 
      data[i] = gris;
      data[i + 1] = gris;
      data[i + 2] = gris;
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
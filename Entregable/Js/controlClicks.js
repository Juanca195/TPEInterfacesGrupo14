

// Esta clase se supone que pueda controlar los clicks para girar las imagenes.
export class controlClicks {
    constructor(canvas, piezas, renderizar) {
        this.canvas = canvas;
        this.piezas = piezas;
        this.renderizar = renderizar;

        this.canvas.addEventListener("mousedown", (event) => {
            this.manejarClick(event);
        });

        this.canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
    }

    manejarClick(event) {
        let pieza = this.buscarPieza(event.offsetX, event.offsetY);

        if (pieza == null) {
            return;
        }

        if (event.button === 0) {
            pieza.rotacion += 90;
        } else if (event.button === 2) {
            pieza.rotacion -= 90;
        } else {
            return;
        }

        this.renderizar();
    }

    buscarPieza(x, y) {
        for (let pieza of this.piezas) {
            if (
                x >= pieza.destinoX &&
                x <= pieza.destinoX + pieza.ancho &&
                y >= pieza.destinoY &&
                y <= pieza.destinoY + pieza.alto
            ) {
                return pieza;
            }
        }

        return null;
    }
}
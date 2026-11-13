
export class Tablero {

    constructor() {
        // 0 = inexistente
        // 1 = ocupado
        // 2 = vacío
        this.matriz = null;

        // pos pozo central, en vacio
        this.filaCentro = 3;
        this.columnaCentro = 3;

        // direcciones a las cuales puedo ir
        // cada una representa [desplazamientoDeFila, desplazamientoDeCol]
        this.movimientos = [
            // Las distancias de 2 permiten saltar una ficha; las de 3, dos fichas consecutivas.
            [-2, -2], // Permite saltar una ficha en diagonal hacia arriba y a la izquierda.
            [-2, 2], // Permite saltar una ficha en diagonal hacia arriba y a la derecha.
            [2, -2], // Permite saltar una ficha en diagonal hacia abajo y a la izquierda.
            [2, 2], // Permite saltar una ficha en diagonal hacia abajo y a la derecha.
            [-2, 0], // Permite saltar una ficha hacia arriba.
            [2, 0], // Permite saltar una ficha hacia abajo.
            [0, -2], // Permite saltar una ficha hacia la izquierda.
            [0, 2], // Permite saltar una ficha hacia la derecha.
            [-3, -3], // Permite saltar dos fichas en diagonal hacia arriba y a la izquierda.
            [-3, 0], // Permite saltar dos fichas hacia arriba.
            [-3, 3], // Permite saltar dos fichas en diagonal hacia arriba y a la derecha.
            [0, -3], // Permite saltar dos fichas hacia la izquierda.
            [0, 3], // Permite saltar dos fichas hacia la derecha.
            [3, -3], // Permite saltar dos fichas en diagonal hacia abajo y a la izquierda.
            [3, 0], // Permite saltar dos fichas hacia abajo.
            [3, 3] // Permite saltar dos fichas en diagonal hacia abajo y a la derecha.
        ]
    }

    inicializar() {
        // Arma la cruz con todos los pozos ocupados
        // excepto el centro (2 = vacío)
        // 0 = inexistente
        // 1 = ocupado
        this.matriz = [
            // 0  1  2  3  4  5  6  
            [0, 0, 1, 1, 1, 0, 0], // 0
            [0, 0, 1, 1, 1, 0, 0], // 1
            [1, 1, 1, 1, 1, 1, 1], // 2
            [1, 1, 1, 2, 1, 1, 1], // 3
            [1, 1, 1, 1, 1, 1, 1], // 4
            [0, 0, 1, 1, 1, 0, 0], // 5
            [0, 0, 1, 1, 1, 0, 0], // 6
        ];

    }

    obtenerEstadoPozo(fila, columna) {
        // Si la fila es menor que 0, la posición está antes del inicio de la matriz.
        // Si la fila es mayor o igual a matriz.length, la posicion esta fuera de la matriz
        if (this.matriz === null || fila < 0 || fila >= this.matriz.length) {
            return 0;
        }

        // Si la columna es menor que 0, la posición está antes del inicio de esa fila.
        // Si la columna es mayor o igual esta fuera de la matriz
        if (columna < 0 || columna >= this.matriz[fila].length) {
            return 0;
        }

        // La fila y la columna existen, devuelve el valor de esa posición.
        return this.matriz[fila][columna];
    }

    esMovimientoValido(filaOrigen, colOrigen, filaDestino, colDestino) {
        // El origen debe contener una ficha para que pueda comenzar el salto.
        if (this.obtenerEstadoPozo(filaOrigen, colOrigen) !== 1) {
            return false;
        }

        // El destino debe ser un pozo vacío.
        if (this.obtenerEstadoPozo(filaDestino, colDestino) !== 2) {
            return false;
        }

        // Calcula cuántas filas separan el origen del destino.
        const diferenciaFila = filaOrigen - filaDestino;
        // Calcula cuántas columnas separan el origen del destino.
        const diferenciaColumna = colOrigen - colDestino;

        // Obtiene la distancia vertical sin importar la dirección del movimiento.
        const distanciaFila = Math.abs(diferenciaFila);
        // Obtiene la distancia horizontal sin importar la dirección del movimiento.
        const distanciaColumna = Math.abs(diferenciaColumna);

        // Usa la distancia mayor como cantidad de pasos del salto.
        const distanciaSalto = Math.max(distanciaFila, distanciaColumna);
        // Solo permite saltos de 2 o 3 casillas: sobre una ficha o sobre dos.
        const distanciaPermitida = distanciaSalto === 2 || distanciaSalto === 3;
        // El movimiento debe ser horizontal, vertical o diagonal, sin cambiar de línea.
        const movimientoEnLinea = distanciaFila === 0 || // Comprueba un salto horizontal.
            distanciaColumna === 0 || // Comprueba un salto vertical.
            distanciaFila === distanciaColumna; // Comprueba un salto diagonal.

        // Rechaza distancias y trayectorias que no correspondan a un salto recto permitido.
        if (!distanciaPermitida || !movimientoEnLinea) {
            return false;
        }

        // Divide el desplazamiento para avanzar una casilla por cada paso del salto.
        const pasoFila = (filaDestino - filaOrigen) / distanciaSalto;
        // Calcula el avance horizontal de cada paso del salto.
        const pasoColumna = (colDestino - colOrigen) / distanciaSalto;

        // Revisa cada pozo entre el origen y el destino.
        for (let paso = 1; paso < distanciaSalto; paso++) {
            // Calcula la fila de la ficha intermedia actual.
            const filaIntermedia = filaOrigen + pasoFila * paso;
            // Calcula la columna de la ficha intermedia actual.
            const columnaIntermedia = colOrigen + pasoColumna * paso;
            // Cada pozo intermedio debe tener una ficha para poder ser saltado.
            if (this.obtenerEstadoPozo(filaIntermedia, columnaIntermedia) !== 1) {
                return false;
            }
        }

        // El movimiento es válido si el destino está vacío y todos los intermedios tienen fichas.
        return true;
    }

    // devuelve una lista de { filaDestino, colDestino } válidos desde un pozo dado.
    obtenerMovimientosPosiblesDesde(fila, columna) {
        const posibles = [];

        for (const movimiento of this.movimientos) {
            //con esto voy verificando el cambio de fila y columna
            const cambioFila = movimiento[0];
            const cambioColumna = movimiento[1];

            const filaDestino = fila + cambioFila;
            const columnaDestino = columna + cambioColumna;

            // valido si son movimientos posibles y se los agrego a posible
            // para luego devolverlos
            const esValido = this.esMovimientoValido(fila, columna, filaDestino, columnaDestino);

            if (esValido) {
                //guarda el objeto con las coordenadas del destino
                // por ejemplo si el calculo resultante es fila 3 y columna 5
                // quedaria 
                //[
                //  {filaDestino: 3, columnDestino: 5}
                //]
                posibles.push({
                    filaDestino: filaDestino,
                    columnaDestino: columnaDestino
                })
            }

        }

        return posibles;

    }

    moverFicha(filaOrigen, colOrigen, filaDestino, colDestino) {
        // calculo la fila y columna, sus respectivas diferencias
        const difFila = filaDestino - filaOrigen;
        const difColumna = colDestino - colOrigen;

        // Calcula la cantidad de casillas que recorre la ficha.
        // Calcula cuántas casillas tiene el recorrido recto.
        const distanciaSalto = Math.max(Math.abs(difFila), Math.abs(difColumna));
        // Calcula el avance vertical de cada paso del recorrido.
        const pasoFila = difFila / distanciaSalto;
        // Calcula el avance horizontal de cada paso del recorrido.
        const pasoColumna = difColumna / distanciaSalto;

        //acomodamos para que se pueda ver el movimento de la fila, 
        //en la primera queda vacio, ya que se movio la ficha
        // Vacía las casillas intermedias, retirando una o dos fichas según el salto.
        //en la ultima colocamos la fila movida
        this.matriz[filaOrigen][colOrigen] = 2;
        // Recorre los pozos intermedios para retirar todas las fichas saltadas.
        for (let paso = 1; paso < distanciaSalto; paso++) {
            // Calcula la fila de la ficha intermedia actual.
            const filaIntermedia = filaOrigen + pasoFila * paso;
            // Calcula la columna de la ficha intermedia actual.
            const columnaIntermedia = colOrigen + pasoColumna * paso;
            // Vacía el pozo intermedio y retira la ficha que estaba allí.
            this.matriz[filaIntermedia][columnaIntermedia] = 2;
        }
        this.matriz[filaDestino][colDestino] = 1;

    }

    hayMovimientosDisponibles() {
        // Recorre toda la matriz buscando si existe
        // al menos un movimiento válido en algún pozo ocupado
        for (let fila = 0; fila < this.matriz.length; fila++) {
            for (let columna = 0; columna < this.matriz[fila].length; columna++) {

                const pozoOcupado = this.matriz[fila][columna] === 1;
                if (!pozoOcupado) {
                    continue;
                }

                const movimientosPosibles = this.obtenerMovimientosPosiblesDesde(fila, columna);
                const tieneAlgunMovimiento = movimientosPosibles.length > 0;

                if (tieneAlgunMovimiento) {
                    return true;
                }
            }
        }

        return false;
    }

    contarFichasRestantes() {
        // Cuenta los pozos en estado "ocupado"
        let cont = 0;
        //
        for (const fila of this.matriz) {
            //va contado por fila los pozos
            for (const pozo of fila) {
                //verificamos que este ocupada
                if (pozo == 1) {
                    cont++;
                }
            }
        }
        return cont;
    }

    // "EN_JUEGO", "GANASTE", "GANASTE_PERFECTO" o "PERDISTE"
    obtenerEstadoDelJuego() {
        const hayMovientos = this.hayMovimientosDisponibles();

        //Si hay movimentos, indicamos que el estado Sea En_JUEGO
        if (hayMovientos) {
            return "EN_JUEGO";
        }

        const ficchasRestantes = this.contarFichasRestantes();

        const unicaFicha = ficchasRestantes === 1;
        //Si quedas mas de una ficha Perdiste
        if (!unicaFicha) {
            return "PERDISTE";
        }

        //guardamos la posicion del centro, para devolver que gano perfecto
        const fichaEnelCentro = this.matriz[this.filaCentro][this.columnaCentro] === 1;
        if (fichaEnelCentro) {
            return "GANASTE_PERFECTO";
        }

        return "GANASTE";

    }

prepararVictoriaPerfecta() {
  this.inicializar();

  // Vacía todos los pozos existentes y conserva los espacios inexistentes.
  this.matriz = this.matriz.map((fila) =>
    fila.map((estado) => (estado === 0 ? 0 : 2))
  );

  // Origen y ficha que se salta.
  this.matriz[3][1] = 1;
  this.matriz[3][2] = 1;
}
}

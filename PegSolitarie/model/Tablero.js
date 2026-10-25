
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
            [-2, 0], //atras
            [2, 0], //adelante
            [0, -2], // abajo
            [0, 2]  // arriba
        ]
    }

    inicializar() {
        // Arma la cruz con todos los pozos ocupados
        // excepto el centro (2 = vacío)
        // 0 = inexistente
        // 1 = ocupado
        this.matriz = [
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 2, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0],
        ];

    }

    obtenerEstadoPozo(fila, columna) {
        // Si la fila es menor que 0, la posición está antes del inicio de la matriz.
        // Si la fila es mayor o igual a matriz.length, la posicion esta fuera de la matriz
        if (fila < 0 && fila >= this.matriz.length) {
            return 0;
        }

        // Si la columna es menor que 0, la posición está antes del inicio de esa fila.
        // Si la columna es mayor o igual esta fuera de la matriz
        if (columna < 0 && columna >= this.matriz[fila].length) {
            return 0;
        }
     
        // La fila y la columna existen, devuelve el valor de esa posición.
        return this.matriz[fila][columna];
    }

    esMovimientoValido(filaOrigen, colOrigen, filaDestino, colDestino) {
        // El origen debe existir y ser una ficha, de lo contrario es mov invalido
        if(this.obtenerEstadoPozo[filaOrigen][colOrigen] == 0 || this.obtenerEstadoPozo[filaOrigen][colOrigen] == 2)
            return false;

        // El destino debe estar vacio, de lo contrario es mov invalido
        if(this.obtenerEstadoPozo[filaDestino][colDestino] != 2)
            return false;


        // Calcula el salto en vertical
        const diferenciaFila = filaOrigen - filaDestino; 
        // Calcula el salto en horizontal
        const diferenciaColumna = colOrigen - colDestino;
        
        // Math.abs nos da el valor positivo 
        const distanciaFila = Math.abs(diferenciaFila);
        const distanciaColumna = Math.abs(diferenciaColumna);

        // Comprobamos que el salto sea extrictamente 2 posiciones hacia cualquiera de los lados
        // Ej: distanciaColumna = 1 y distanciaFila = 0 (es decir que me movi 1 solo lugar hacia la derecha)
        // saltoHorizontal = distanciaColumna === 2 -> false && distanciaFila === 0 -> true 
        // AND nos restringe a que ambos tengan el mismo valor de verdad.
        // Cuando llegue a if(!saltoHorizontal || !saltoVertical) como saltoHorizontal dio false, el movimiento sera invalido
        // OR necesita que al menos un valor se cumpla, y como saltoHorizontal = false -> !saltoHorizontal se cumple.
        const saltoHorizontal = distanciaColumna === 2 && distanciaFila === 0;
        const saltoVertical = distanciaFila === 2 && distanciaColumna === 0;

        if(!saltoHorizontal || !saltoVertical)
            return false;
        
        // Calculamos la ubicacion de la ficha intermedia (esta en la mitad del recorrido)
        const fichaIntermediaFila = filaOrigen + Math.floor(diferenciaFila/2);
        const fichaIntermediaColumna = colOrigen + Math.floor(diferenciaColumna/2);
        
        // Comprobamos que tiene que haber una ficha existente de por medio
        if(this.obtenerEstadoPozo(fichaIntermediaFila,fichaIntermediaColumna) != 1)
            return false;
        
        return true;
    }

    obtenerMovimientosPosiblesDesde(fila, columna) {
        // NUEVO respecto a la versión anterior:
        // devuelve una lista de { filaDestino, colDestino } válidos
        // desde un pozo dado. Esto es lo que vas a usar
        // para dibujar los hints animados (flechas) cuando el jugador
        // selecciona una ficha
    }

    moverFicha(filaOrigen, colOrigen, filaDestino, colDestino) {
        // Vacía origen, come la ficha intermedia, ocupa destino
    }

    hayMovimientosDisponibles() {
        // Recorre toda la matriz buscando si existe
        // al menos un movimiento válido en algún pozo ocupado
    }

    contarFichasRestantes() {
        // Cuenta los pozos en estado "ocupado"
    }

    obtenerEstadoDelJuego() {
        // "EN_JUEGO", "GANASTE", "GANASTE_PERFECTO" o "PERDISTE"
    }
}

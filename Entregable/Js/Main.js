import { Juego } from "./Juego.js";

const bancoJuegos = [
    "../Entregable/assets/fondo1.jpg",
    "../Entregable/assets/fondo2.jpg",
    "../Entregable/assets/fondo6.jpg",
    "../Entregable/assets/fondo7.jpg"
];

const niveles = [
    {filas: 2, columnas: 2},
    {filas: 3, columnas: 2},
    {filas: 3, columnas: 3}
];
 
const juego = new Juego("myCanvas", bancoJuegos, niveles);
juego.iniciar();


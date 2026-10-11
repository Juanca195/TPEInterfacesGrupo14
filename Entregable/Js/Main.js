import { Juego } from "./Juego.js";

const bancoJuegos = [
    "../Entregable/assets/fondo1.jpg",
    "../Entregable/assets/fondo2.jpg",
    "../Entregable/assets/fondo6.jpg",
    "../Entregable/assets/fondo7.jpg",
    "../Entregable/assets/fondo8.jpg",
    "../Entregable/assets/fondo9.jpg",
    "../Entregable/assets/fondo10.jpg"
];

const niveles = [
    {filas: 2, columnas: 2, tiempo : 10},
    {filas: 2, columnas: 3, tiempo : 90},
    {filas: 2, columnas: 4, tiempo : 120}
];
 
const juego = new Juego("myCanvas", bancoJuegos, niveles);
juego.iniciar();


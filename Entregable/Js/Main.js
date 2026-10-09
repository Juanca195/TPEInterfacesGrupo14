import { Juego } from "./Juego.js";

const bancoJuegos = [
    "../Entregable/assets/fondo1.jpg",
    "../Entregable/assets/fondo2.jpg",
    "../Entregable/assets/fondo6.jpg",
    "../Entregable/assets/fondo7.jpg"
];
 
const juego = new Juego("myCanvas", bancoJuegos);
juego.iniciar();


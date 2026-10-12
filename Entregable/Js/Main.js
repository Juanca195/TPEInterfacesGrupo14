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

// Se podrian agregar mas niveles 
const niveles = [
    {filas: 2, columnas: 2, tiempo : 40},
    {filas: 2, columnas: 3, tiempo : 60},
    {filas: 2, columnas: 4, tiempo : 90},
    {filas: 3, columnas: 3, tiempo : 90}
];
 
const juego = new Juego("myCanvas", bancoJuegos, niveles);
juego.iniciar();


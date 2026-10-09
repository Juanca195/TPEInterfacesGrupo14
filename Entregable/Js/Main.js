import { Juego } from "./Juego.js";

const bancoJuegos = ["paisaje.jpg", "paisaje2.jpg", "paisaje3.jpg"];
 
const juego = new Juego("myCanvas", bancoJuegos);
juego.iniciar();


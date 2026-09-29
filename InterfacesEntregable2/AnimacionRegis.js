
const form = document.getElementById("form");       
const btn = document.getElementById("btn");         
const texto = document.getElementById("texto");     
const spinner = document.getElementById("spinner"); 


let girando = false; // interruptor: true = el spinner gira, false = se detiene
let angulo = 0;      // grados que lleva girado


function girar() {
  if (!girando) return;                            // si no debe girar, corta el ciclo
  angulo = (angulo + 6) % 360;                     // suma 6 grados (vuelve a 0 al llegar a 360)
  spinner.style.transform = "rotate(" + angulo + "deg)"; // aplica la rotación
  requestAnimationFrame(girar);                    // se vuelve a llamar en el siguiente cuadro
}


// Antes escuchabas el "click" del botón. Ahora escuchamos el "submit"
// del formulario: solo se dispara si los datos pasaron la validación
// (por ejemplo, campos "required" o tipo email).
form.addEventListener("submit", async (e) => {

  // Frena el envío automático. Sin esto, la página se recarga al instante
  // y la animación no alcanza a verse.
  e.preventDefault();

  
  btn.classList.add("loading");          // activa los estilos de carga
  texto.textContent = "Registrando...";  
  girando = true;                        // enciende el interruptor
  girar();                               // arranca el giro del spinner

  await new Promise(r => setTimeout(r, 1500));

    girando = false;                       
    btn.classList.remove("loading");       // quita el estado de carga
    btn.classList.add("done");             // pone el botón verde
    texto.textContent = "✓ ¡Registrado!";  // texto final

 
  btn.classList.add("pop");                              // agranda el botón
  setTimeout(() => btn.classList.remove("pop"), 200);    // lo devuelve a su tamaño

  
  // Espera 1 segundo para que el usuario alcance a ver el botón verde
  // y recién después envía el formulario (esto recarga o cambia de página).
  await new Promise(r => setTimeout(r, 1000));
  form.submit();
});
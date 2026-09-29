
const form = document.getElementById("form");       
const btn = document.getElementById("btn-login");         
const texto = document.getElementById("texto");     
const spinner = document.getElementById("spinner"); 

// Variables para transicion
const overlay = document.getElementById('loading-overlay');
const loadingText = document.querySelector('.loading-text');
const progress = document.querySelector('.progress');
const progressNumber = document.querySelector('.persent');


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
  overlay.hidden = false;

  let dots = '';
  let progressWidth = 0;

  
  await new Promise((resolve) => {
    
    const textInterval = setInterval(() => {
      dots = dots.length < 3 ? dots + '.' : '';
      loadingText.innerHTML = 'Preparando la diversion' + dots;
    }, 500);
    
    const progressInterval = setInterval(() => {
      progressWidth += 2;
      progress.style.width = progressWidth + '%';
      progressNumber.textContent = progressWidth + '%';

      if (progressWidth >= 100) {
        clearInterval(progressInterval);
        clearInterval(textInterval)
        loadingText.textContent = '¡Disfruta tu experiencia!';
        resolve(); // recién acá se resuelve la promesa
      }
    }, 50);
  });

  setTimeout(() => {
    window.location.href = 'Inicio.html';
  },50);

  await new Promise(r => setTimeout(r, 500));

  form.submit();
});
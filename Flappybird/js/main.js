/// Prueba de juego solo como ilustracion
//

// Busca en el HTML el área de dibujo, el marcador y los controles del juego.
const canvas = document.querySelector("#lienzo-juego");
const context = canvas.getContext("2d");
const scoreLabel = document.querySelector("#marcador");
const messageScreen = document.querySelector("#pantalla-mensaje");
const messageTitle = document.querySelector("#titulo-mensaje");
const messageText = document.querySelector("#texto-mensaje");
const startButton = document.querySelector("#boton-inicio");

// Guarda el tamaño del mundo del juego, que coincide con el tamaño lógico del canvas.
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_HEIGHT = 60;
const GROUND_Y = HEIGHT - GROUND_HEIGHT;

// Junta las variables que cambian durante una partida en un único objeto.
const game = {
  state: "menu",
  score: 0,
  lastFrameTime: 0,
  elapsedTime: 0,
  groundOffset: 0,
  pipes: [],
  player: {
    x: 120,
    y: HEIGHT / 2,
    width: 58,
    height: 58,
    velocityY: 0,
    animationTime: 0,
    frame: 0
  }
};

// Carga el spritesheet; sus tres cuadros están distribuidos horizontalmente.
const playerImage = new Image();
playerImage.src = "img/goku_base_vuelo_3f.png";
playerImage.addEventListener("error", () => {
  // Informa el problema y deja que el juego use el dibujo alternativo de Goku.
  console.error("No se pudo cargar img/goku_base_vuelo_3f.png; se usará el dibujo alternativo.");
});

// Al iniciar, crea los eventos y dibuja la pantalla inicial.
startButton.addEventListener("click", startGame);
canvas.addEventListener("pointerdown", handleCanvasPress);
document.addEventListener("keydown", handleKeyPress);
draw();

// Reinicia las variables de la partida y pone en marcha la animación.
function startGame() {
  game.state = "playing";
  game.score = 0;
  game.elapsedTime = 0;
  game.groundOffset = 0;
  game.pipes = [];
  game.player.y = HEIGHT / 2;
  game.player.velocityY = 0;
  game.player.animationTime = 0;
  game.player.frame = 0;
  game.lastFrameTime = 0;

  // Coloca el primer par de obstáculos más adelante para dar tiempo a reaccionar.
  addPipe(WIDTH + 100);
  updateScore();
  messageScreen.hidden = true;
  requestAnimationFrame(gameLoop);
}

// Recibe cada cuadro de animación, actualiza el mundo y vuelve a dibujarlo.
function gameLoop(timestamp) {
  // Evita que el primer cuadro o una pestaña pausada produzcan un salto de tiempo.
  const deltaTime = game.lastFrameTime === 0
    ? 0
    : Math.min((timestamp - game.lastFrameTime) / 1000, 0.032);

  game.lastFrameTime = timestamp;

  // Solo se modifican las posiciones mientras la partida está activa.
  if (game.state === "playing") {
    update(deltaTime);
  }

  // Dibuja el estado actual y solicita el siguiente cuadro si se sigue jugando.
  draw();
  if (game.state === "playing") {
    requestAnimationFrame(gameLoop);
  }
}

// Actualiza la física del jugador, los obstáculos y el puntaje.
function update(deltaTime) {
  const player = game.player;

  // La gravedad acelera la caída y la velocidad cambia la posición vertical.
  player.velocityY += 1500 * deltaTime;
  player.y += player.velocityY * deltaTime;

  // Cambia el cuadro del spritesheet para simular el movimiento de vuelo.
  player.animationTime += deltaTime;
  if (player.animationTime >= 0.12) {
    player.animationTime = 0;
    player.frame = (player.frame + 1) % 3;
  }

  // Desplaza el suelo y los obstáculos a velocidad constante hacia la izquierda.
  const pipeSpeed = 190;
  game.groundOffset = (game.groundOffset + pipeSpeed * deltaTime) % 40;
  game.elapsedTime += deltaTime;

  for (const pipe of game.pipes) {
    pipe.x -= pipeSpeed * deltaTime;
  }

  // Crea un nuevo par de obstáculos cuando el anterior ya avanzó lo suficiente.
  const lastPipe = game.pipes[game.pipes.length - 1];
  if (lastPipe && lastPipe.x < WIDTH - 250) {
    addPipe(WIDTH + 20);
  }

  // Elimina obstáculos que ya salieron de la pantalla para no acumularlos.
  game.pipes = game.pipes.filter((pipe) => pipe.x + pipe.width > 0);

  // Suma un punto cuando el jugador pasa completamente el par de obstáculos.
  for (const pipe of game.pipes) {
    if (!pipe.passed && pipe.x + pipe.width < player.x) {
      pipe.passed = true;
      game.score += 1;
      updateScore();
    }
  }

  // Termina la partida si Goku toca el techo, el suelo o un obstáculo.
  if (player.y - player.height / 2 < 0
      || player.y + player.height / 2 > GROUND_Y
      || game.pipes.some((pipe) => hitsPipe(player, pipe))) {
    endGame();
  }
}

// Añade un par de obstáculos con un espacio libre colocado al azar.
function addPipe(x) {
  const gapHeight = 175;
  const minimumTop = 55;
  const maximumTop = GROUND_Y - gapHeight - 55;
  const gapTop = minimumTop + Math.random() * (maximumTop - minimumTop);

  game.pipes.push({
    x,
    width: 76,
    gapTop,
    gapHeight,
    passed: false
  });
}

// Comprueba si el rectángulo de Goku se cruza con la parte superior o inferior.
function hitsPipe(player, pipe) {
  const playerLeft = player.x - player.width * 0.36;
  const playerRight = player.x + player.width * 0.36;
  const playerTop = player.y - player.height * 0.36;
  const playerBottom = player.y + player.height * 0.36;
  const overlapsHorizontally = playerRight > pipe.x && playerLeft < pipe.x + pipe.width;
  const gapBottom = pipe.gapTop + pipe.gapHeight;
  const outsideGap = playerTop < pipe.gapTop || playerBottom > gapBottom;

  return overlapsHorizontally && outsideGap;
}

// Finaliza el juego y muestra el resultado con una opción para volver a intentar.
function endGame() {
  game.state = "over";
  messageTitle.textContent = "¡Fin del juego!";
  messageText.textContent = `Tu puntaje fue ${game.score}. ¿Querés intentarlo otra vez?`;
  startButton.textContent = "Volver a jugar";
  messageScreen.hidden = false;
}

// Actualiza el texto del marcador que aparece arriba del canvas.
function updateScore() {
  scoreLabel.textContent = `Puntaje: ${game.score}`;
}

// Hace que cada clic o toque dentro del canvas impulse a Goku hacia arriba.
function handleCanvasPress(event) {
  event.preventDefault();

  if (game.state === "playing") {
    flap();
  }
}

// Permite volar con la barra espaciadora o la flecha hacia arriba.
function handleKeyPress(event) {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();

    // Ignora la repetición automática de la tecla para evitar saltos involuntarios.
    if (!event.repeat && game.state === "playing") {
      flap();
    }
  }
}

// Aplica un impulso vertical hacia arriba.
function flap() {
  game.player.velocityY = -470;
}

// Dibuja el cielo, los elementos decorativos, obstáculos, suelo y personaje.
function draw() {
  drawBackground();

  // Los obstáculos se dibujan antes que el personaje para mantener el orden visual.
  for (const pipe of game.pipes) {
    drawPipe(pipe);
  }

  drawGround();
  drawPlayer();
}

// Pinta el cielo y algunas nubes decorativas en posiciones fijas.
function drawBackground() {
  context.fillStyle = "#87ceeb";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  // Dibuja tres nubes simples con círculos para darle profundidad al fondo.
  drawCloud(80, 110);
  drawCloud(340, 205);
  drawCloud(220, 330);
}

// Dibuja una nube usando círculos blancos superpuestos.
function drawCloud(x, y) {
  context.fillStyle = "#ffffffb8";
  context.beginPath();
  context.arc(x, y, 22, 0, Math.PI * 2);
  context.arc(x + 24, y - 10, 28, 0, Math.PI * 2);
  context.arc(x + 52, y, 21, 0, Math.PI * 2);
  context.fill();
}

// Dibuja las dos partes de un obstáculo y deja libre el hueco para volar.
function drawPipe(pipe) {
  const bottomY = pipe.gapTop + pipe.gapHeight;
  const pipeBottom = GROUND_Y - bottomY;

  // Cada parte tiene un cuerpo rectangular y un borde más ancho en la punta.
  drawPipePart(pipe.x, 0, pipe.width, pipe.gapTop, false);
  drawPipePart(pipe.x, bottomY, pipe.width, pipeBottom, true);
}

// Dibuja una sección de obstáculo con color, borde y tapa.
function drawPipePart(x, y, width, height, hasTopCap) {
  const capHeight = 22;
  const capY = hasTopCap ? y : y + height - capHeight;

  context.fillStyle = "#42a84a";
  context.strokeStyle = "#246b31";
  context.lineWidth = 4;
  context.fillRect(x, y, width, height);
  context.strokeRect(x, y, width, height);

  // La tapa sobresale un poco del cuerpo para distinguir los extremos del obstáculo.
  context.fillStyle = "#63c65c";
  context.fillRect(x - 5, capY, width + 10, capHeight);
  context.strokeRect(x - 5, capY, width + 10, capHeight);

  // Agrega una franja clara como reflejo para que el tubo no se vea plano.
  context.fillStyle = "#a3e879";
  context.fillRect(x + 10, y + (hasTopCap ? capHeight : 0), 8, Math.max(0, height - capHeight));
}

// Dibuja el suelo con franjas que se mueven para dar sensación de avance.
function drawGround() {
  context.fillStyle = "#d9a441";
  context.fillRect(0, GROUND_Y, WIDTH, GROUND_HEIGHT);

  context.fillStyle = "#73bf45";
  context.fillRect(0, GROUND_Y, WIDTH, 12);

  context.strokeStyle = "#b47d2c";
  context.lineWidth = 3;
  for (let x = -game.groundOffset; x < WIDTH; x += 40) {
    context.beginPath();
    context.moveTo(x, GROUND_Y + 20);
    context.lineTo(x + 20, GROUND_Y + GROUND_HEIGHT);
    context.stroke();
  }
}

// Dibuja el cuadro actual del spritesheet o una figura alternativa si no cargó.
function drawPlayer() {
  const player = game.player;
  const drawX = player.x - player.width / 2;
  const drawY = player.y - player.height / 2;

  if (playerImage.complete && playerImage.naturalWidth > 0) {
    // El archivo tiene tres cuadros iguales, uno al lado del otro.
    const frameWidth = playerImage.naturalWidth / 3;
    const frameHeight = playerImage.naturalHeight;

    context.drawImage(
      playerImage,
      player.frame * frameWidth,
      0,
      frameWidth,
      frameHeight,
      drawX,
      drawY,
      player.width,
      player.height
    );
    return;
  }

  // Dibuja un personaje sencillo si la imagen todavía no está disponible.
  context.fillStyle = "#f28c28";
  context.beginPath();
  context.arc(player.x, player.y, player.width / 2, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#8b3e12";
  context.lineWidth = 3;
  context.stroke();

  // Ojo y mechón hacen que el dibujo alternativo también recuerde a Goku.
  context.fillStyle = "#fff";
  context.beginPath();
  context.arc(player.x + 10, player.y - 7, 8, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#17324d";
  context.beginPath();
  context.arc(player.x + 12, player.y - 7, 3, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#242424";
  context.beginPath();
  context.moveTo(player.x - 12, player.y - 22);
  context.lineTo(player.x - 5, player.y - 35);
  context.lineTo(player.x + 1, player.y - 20);
  context.fill();
}

// Mini Tennis Game: computer paddle vs user paddle

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const computerScoreText = document.getElementById("computerScore");
const userScoreText = document.getElementById("userScore");
const message = document.getElementById("message");

const paddleWidth = 115;
const paddleHeight = 13;
const ballRadius = 9;

const user = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: canvas.height - 35,
  speed: 7,
  score: 0
};

const computer = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: 22,
  speed: 4.2,
  score: 0
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  dx: 4,
  dy: 4,
  speed: 4
};

let leftPressed = false;
let rightPressed = false;
let running = false;
let animationId = null;

function drawCourt() {
  ctx.fillStyle = "#16834a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Court boundary and centre line
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 3;
  ctx.strokeRect(25, 12, canvas.width - 50, canvas.height - 24);
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(25, canvas.height / 2);
  ctx.lineTo(canvas.width - 25, canvas.height / 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(paddle, color) {
  ctx.fillStyle = color;
  ctx.fillRect(paddle.x, paddle.y, paddleWidth, paddleHeight);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.closePath();
}

function drawGame() {
  drawCourt();
  drawPaddle(computer, "#ffcf33");
  drawPaddle(user, "#ffffff");
  drawBall();
}

function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 4;
  ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
  ball.dy = direction * ball.speed;
}

function updateScore() {
  computerScoreText.textContent = computer.score;
  userScoreText.textContent = user.score;
}

function awardPoint(winner) {
  running = false;

  if (winner === "user") {
    user.score++;
    message.textContent = "Point to YOU! The ball crossed the computer's boundary.";
  } else {
    computer.score++;
    message.textContent = "Point to COMPUTER! The ball crossed your boundary.";
  }

  updateScore();
  drawGame();

  // Automatically serve again after a short pause.
  window.setTimeout(() => {
    resetBall(winner === "user" ? -1 : 1);
    if (user.score >= 5 || computer.score >= 5) {
      message.textContent = user.score >= 5
        ? "🎉 You win the game! Press Reset to play again."
        : "Computer wins! Press Reset to play again.";
      return;
    }
    message.textContent = "Get ready! Press Start Game to continue.";
    drawGame();
  }, 1100);
}

function movePaddles() {
  if (leftPressed) user.x -= user.speed;
  if (rightPressed) user.x += user.speed;

  user.x = Math.max(25, Math.min(canvas.width - 25 - paddleWidth, user.x));

  // Simple computer AI follows the ball, with a little delay.
  const computerCenter = computer.x + paddleWidth / 2;
  if (computerCenter < ball.x - 8) computer.x += computer.speed;
  if (computerCenter > ball.x + 8) computer.x -= computer.speed;
  computer.x = Math.max(25, Math.min(canvas.width - 25 - paddleWidth, computer.x));
}

function updateBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Side boundaries: bounce the ball back into the court.
  if (ball.x - ballRadius <= 25 || ball.x + ballRadius >= canvas.width - 25) {
    ball.dx *= -1;
    message.textContent = "The ball hit the side boundary!";
  }

  // User paddle collision.
  if (
    ball.dy > 0 &&
    ball.y + ballRadius >= user.y &&
    ball.y - ballRadius <= user.y + paddleHeight &&
    ball.x >= user.x &&
    ball.x <= user.x + paddleWidth
  ) {
    ball.dy = -Math.abs(ball.dy);
    ball.dx += (ball.x - (user.x + paddleWidth / 2)) * 0.045;
    message.textContent = "Nice return! You hit the ball.";
  }

  // Computer paddle collision.
  if (
    ball.dy < 0 &&
    ball.y - ballRadius <= computer.y + paddleHeight &&
    ball.y + ballRadius >= computer.y &&
    ball.x >= computer.x &&
    ball.x <= computer.x + paddleWidth
  ) {
    ball.dy = Math.abs(ball.dy);
    ball.dx += (ball.x - (computer.x + paddleWidth / 2)) * 0.035;
    message.textContent = "Computer returned the ball!";
  }

  // Top and bottom boundaries award points.
  if (ball.y - ballRadius <= 12) {
    awardPoint("user");
  } else if (ball.y + ballRadius >= canvas.height - 12) {
    awardPoint("computer");
  }
}

function gameLoop() {
  if (!running) return;
  movePaddles();
  updateBall();
  drawGame();

  if (running) animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  if (user.score >= 5 || computer.score >= 5) {
    message.textContent = "Game over. Press Reset to start a new game.";
    return;
  }
  if (!running) {
    running = true;
    message.textContent = "Game started! Return the ball.";
    gameLoop();
  }
}

function pauseGame() {
  running = false;
  if (animationId) cancelAnimationFrame(animationId);
  message.textContent = "Game paused.";
  drawGame();
}

function resetGame() {
  pauseGame();
  user.score = 0;
  computer.score = 0;
  user.x = canvas.width / 2 - paddleWidth / 2;
  computer.x = canvas.width / 2 - paddleWidth / 2;
  resetBall(Math.random() > 0.5 ? 1 : -1);
  updateScore();
  message.textContent = "New game! Press Start Game.";
  drawGame();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    leftPressed = true;
    event.preventDefault();
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    rightPressed = true;
    event.preventDefault();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") leftPressed = false;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") rightPressed = false;
});

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);

// Show the court before the first game starts.
resetBall(1);
updateScore();
drawGame();

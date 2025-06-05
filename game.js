const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let elapsedTime = 0;
let timerInterval = null;
let timerRunning = false;
let score = 0;
let ballRadius = 8;
let dx = 4;
let dy = -4;
let ballLaunched = false;
let x;
let y;
let paddleHeight = 10;
let paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = canvas.width / brickColumnCount;
const brickHeight = 60;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}
let activeSpecialBlock = null;
let specialBlockStartTime = 0;

function chooseSpecialBlock() {
  const candidates = [];
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        candidates.push({ c, r });
      }
    }
  }
  if (candidates.length > 0) {
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    activeSpecialBlock = chosen;
specialBlockStartTime = Date.now();
  }
}

setInterval(() => {
  chooseSpecialBlock();
}, 4000);

const blockImg = new Image();
blockImg.src = "block_logo.png";
const ballImg = new Image();
ballImg.src = "ball_logo.png";

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

document.addEventListener("keydown", (e) => {
  if ((e.key === "ArrowUp" || e.key === "Up") && !ballLaunched && window.readyToLaunch) {
    ballLaunched = true;
    dx = 0;
    dy = -4;
    if (!timerRunning) startTimer();score = 0;
    document.getElementById("scoreDisplay").textContent = "score 0 pxp.";
  
  }
});

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) paddleX = relativeX - paddleWidth / 2;
}

function drawBricks() {
  if (!activeSpecialBlock) console.warn("activeSpecialBlock is null");
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * brickWidth;
        const brickY = r * brickHeight;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.drawImage(blockImg, brickX, brickY, brickWidth, brickHeight);

        // Knipperend effect op geselecteerd blokje
        if (activeSpecialBlock && activeSpecialBlock.c === c && activeSpecialBlock.r === r && !fallingFlag) {
          if (Date.now() - specialBlockStartTime <= 10000 && Math.floor(Date.now() / 400) % 2 === 0) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 4;
            ctx.strokeRect(brickX + 2, brickY + 2, brickWidth - 4, brickHeight - 4);
          }
        }
      }
    }
  }
}

function drawBall() {
  ctx.drawImage(ballImg, x, y, ballRadius * 2, ballRadius * 2);
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function startTimer() {
  timerRunning = true;
  timerInterval = setInterval(() => {
    elapsedTime++;
    const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
    const seconds = String(elapsedTime % 60).padStart(2, '0');
    document.getElementById("timeDisplay").textContent = "time " + minutes + ":" + seconds;
  }, 1000);
}



function saveHighscore() {
  const timeText = document.getElementById("timeDisplay").textContent.replace("time ", "");
  const highscore = {
    name: window.currentPlayer || "Unknown",
    score: score,
    time: timeText
  };

  let highscores = JSON.parse(localStorage.getItem("highscores")) || [];
  if (!highscores.some(h => h.name === highscore.name && h.score === highscore.score && h.time === highscore.time)) {
    highscores.push(highscore);
  }
  highscores.sort((a, b) => b.score - a.score || a.time.localeCompare(b.time));
  highscores = highscores.slice(0, 10);
  localStorage.setItem("highscores", JSON.stringify(highscores));

  const list = document.getElementById("highscore-list");
  list.innerHTML = "";
  highscores.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1} ${entry.name} - ${entry.score} pxp - ${entry.time}`;
    list.appendChild(li);
  });
}

const coinImg = new Image();
coinImg.src = "pxp coin perfect_clipped_rev_1.png";
let coins = [];

function spawnCoin(x, y) {
  coins.push({ x: x + brickWidth / 2 - 12, y: y, radius: 12, active: true });
}

function drawCoins() {
  coins.forEach(coin => {
    if (coin.active) {
      ctx.drawImage(coinImg, coin.x, coin.y, 24, 24);
      coin.y += 2;
    }
  });
}

function checkCoinCollision() {
  coins.forEach(coin => {
    if (
      coin.active &&
      coin.y + coin.radius * 2 >= canvas.height - paddleHeight &&
      coin.x + coin.radius > paddleX &&
      coin.x < paddleX + paddleWidth
    ) {
      coin.active = false;
      score += 5;
      document.getElementById("scoreDisplay").textContent = "score " + score + " pxp.";
    }
  });
}

function resetBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
    }
  }
}



let imagesLoaded = 0;
function onImageLoad() {
  imagesLoaded++;
  if (imagesLoaded === 2) {
    x = paddleX + paddleWidth / 2 - ballRadius;
    y = canvas.height - paddleHeight - ballRadius * 2;
    draw();
  }
}
blockImg.onload = onImageLoad;
ballImg.onload = onImageLoad;
document.addEventListener("keydown", function (e) {
  if (!ballMoving && (e.code === "ArrowUp" || e.code === "Space")) {
    if (lives <= 0) {
      lives = 3;
      score = 0;
      level = 1;
      resetBricks();
      resetBall();
      resetPaddle();
      startTime = new Date();
      gameOver = false;
      updateScoreDisplay();
      updateTimeDisplay();
      score = 0;

    }
    ballMoving = true;
  }
});

// --- Vlaggetjes & Schietfunctie na knipperblokje ---
let flagActive = false;
let flagCollected = false;
let flagStartTime = 0;
let flagXOffset = 0;
let bullets = [];
let bonusCoins = [];
const flagImg = new Image();
flagImg.src = "vlaggetjes.png";

function spawnFlags(x) {
  flagActive = true;
  flagCollected = false;
  flagXOffset = x - paddleX;
  flagStartTime = Date.now();
}

function collectFlag() {
  flagCollected = true;
  flagStartTime = Date.now();
}

function drawFlags() {
  if (!flagActive) return;

  const now = Date.now();
  const elapsed = now - flagStartTime;
  if (elapsed > 15000) {
    flagActive = false;
    flagCollected = false;
    bullets = [];
    return;
  }

  const flagX = paddleX + flagXOffset;
  const flagY = canvas.height - paddleHeight - 50;

  if (flagCollected || (!flagCollected && Math.floor(now / 300) % 2 === 0)) {
    ctx.drawImage(flagImg, flagX, flagY, 30, 50);
    ctx.drawImage(flagImg, flagX + paddleWidth - 40, flagY, 30, 50);
  }
}

document.addEventListener("keydown", (e) => {
  if (flagCollected && (e.key === "ArrowUp" || e.key === " ")) {
    shootBullets();
  }
});

document.addEventListener("click", () => {
  if (flagCollected) {
    shootBullets();
  }
});

function shootBullets() {
  const bulletY = canvas.height - paddleHeight - 50;
  bullets.push({ x: paddleX + 10, y: bulletY });
  bullets.push({ x: paddleX + paddleWidth - 20, y: bulletY });
}

function drawBullets() {
  ctx.fillStyle = "gold";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    b.y -= 5;
  });
  bullets = bullets.filter(b => b.y > 0);
}

function checkBulletCollision() {
  bullets.forEach(bullet => {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          const bx = c * brickWidth;
          const by = r * brickHeight;
          if (bullet.x > bx && bullet.x < bx + brickWidth && bullet.y > by && bullet.y < by + brickHeight) {
            b.status = 0;
            score += 10;
            spawnCoin(bx, by);
            bonusCoins.push({ x: bx + brickWidth / 2 - 12, y: by, radius: 12, active: true });
          }
        }
      }
    }
  });
}

function drawBonusCoins() {
  bonusCoins.forEach(coin => {
    if (coin.active) {
      ctx.drawImage(coinImg, coin.x, coin.y, 24, 24);
      coin.y += 2;
    }
  });
}

function checkBonusCoinCollision() {
  bonusCoins.forEach(coin => {
    if (coin.active && coin.y + coin.radius * 2 >= canvas.height - paddleHeight && coin.x + coin.radius > paddleX && coin.x < paddleX + paddleWidth) {
      coin.active = false;
      score += 5;
      document.getElementById("scoreDisplay").textContent = "score " + score + " pxp.";
    }
  });
}

const originalCollision = collisionDetection;





function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score += 10;
          spawnCoin(b.x, b.y);
          document.getElementById("scoreDisplay").textContent = "score " + score + " pxp.";
        }
      }
    }
  }
}

function draw() {
  collisionDetection();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCoins();
  checkCoinCollision();
  drawBricks();
  drawBall();
  drawPaddle();

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  if (ballLaunched) {
    x += dx;
    y += dy;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;

    if (y + dy > canvas.height - paddleHeight - ballRadius &&
        x > paddleX && x < paddleX + paddleWidth) {
      const hitPos = (x - paddleX) / paddleWidth;
      const angle = (hitPos - 0.5) * Math.PI / 2;
      const speed = Math.sqrt(dx * dx + dy * dy);
      dx = speed * Math.sin(angle);
      dy = -Math.abs(speed * Math.cos(angle));
    }

    if (y + dy > canvas.height - ballRadius) {
      saveHighscore();
      ballLaunched = false;
      dx = 4;
      dy = -4;
      elapsedTime = 0;
      timerRunning = false;
      clearInterval(timerInterval);
    }
  } else {
    x = paddleX + paddleWidth / 2 - ballRadius;
    resetBricks();
    y = canvas.height - paddleHeight - ballRadius * 2;
  }

  requestAnimationFrame(draw);
}


// -- EXTRA: vlaggetje laten vallen en opvangen --
let fallingFlag = null;

function updateFallingFlag() {
  if (!fallingFlag) return;

  ctx.drawImage(flagImg, fallingFlag.x, fallingFlag.y, 30, 50);
  fallingFlag.y += 3;

  // Paddle raakt vlag
  if (
    fallingFlag.y + 50 >= canvas.height - paddleHeight &&
    fallingFlag.x + 30 > paddleX &&
    fallingFlag.x < paddleX + paddleWidth
  ) {
    collectFlag();
    fallingFlag = null;
  }

  // Buiten beeld
  if (fallingFlag.y > canvas.height) {
    fallingFlag = null;
  }
}

// Pas collisionDetection aan zodat vlaggetje gaat vallen
collisionDetection = function () {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score += 10;
          spawnCoin(b.x, b.y);
          document.getElementById("scoreDisplay").textContent = "score " + score + " pxp.";

          // Start vlag
          if (activeSpecialBlock && activeSpecialBlock.c === c && activeSpecialBlock.r === r && !fallingFlag) {
            fallingFlag = {
              x: b.x + brickWidth / 2 - 15,
              y: b.y
            };
          }
        }
      }
    }
  }
};

// Voeg toe aan draw()
const originalDraw = draw;
draw = function () {
  collisionDetection();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCoins();
  drawBonusCoins();
  checkCoinCollision();
  checkBonusCoinCollision();
  drawBricks();
  drawBall();
  drawPaddle();
  updateFallingFlag();
  drawFlags();
  drawBullets();
  checkBulletCollision();

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  if (ballLaunched) {
    x += dx;
    y += dy;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;

    if (
      y + dy > canvas.height - paddleHeight - ballRadius &&
      x > paddleX &&
      x < paddleX + paddleWidth
    ) {
      const hitPos = (x - paddleX) / paddleWidth;
      const angle = (hitPos - 0.5) * Math.PI / 2;
      const speed = Math.sqrt(dx * dx + dy * dy);
      dx = speed * Math.sin(angle);
      dy = -Math.abs(speed * Math.cos(angle));
    }

    if (y + dy > canvas.height - ballRadius) {
      saveHighscore();
      ballLaunched = false;
      dx = 4;
      dy = -4;
      elapsedTime = 0;
      timerRunning = false;
      clearInterval(timerInterval);
    }
  } else {
    x = paddleX + paddleWidth / 2 - ballRadius;
    resetBricks();
    y = canvas.height - paddleHeight - ballRadius * 2;
  }

  requestAnimationFrame(draw);
};

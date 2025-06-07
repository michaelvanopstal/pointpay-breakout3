
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
let flagsOnPaddle = false;
let flagTimer = 0;
let powerBlockUsed = false;
let flyingCoins = [];
let powerBlockRespawnTime = 100000; // 3 minuten in ms
let powerBlockHitTime = null;
let lives = 3;
let level = 1;
let gameOver = false;
let ballMoving = false;
let rocketBlock = { x: 0, y: 0, col: 0, row: 0, active: false };
let rocketOnPaddle = false;
let rocketFired = false;
let rocket = null;
let explosionParticles = [];
let rocketSmokeParticles = [];
let rocketExplosionParticles = [];




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

const blockImg = new Image();
blockImg.src = "block_logo.png";
const ballImg = new Image();
ballImg.src = "ball_logo.png";
const vlagImgLeft = new Image();
vlagImgLeft.src = "vlaggetje1.png";

const vlagImgRight = new Image();
vlagImgRight.src = "vlaggetje2.png";
const shootCoinImg = new Image();
shootCoinImg.src = "3.png"; 



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

document.addEventListener("keydown", function (e) {
  if (flagsOnPaddle) {
    if (e.code === "Space" || e.code === "ArrowUp") {
      shootFromFlags(); 
    }
  }
});

document.addEventListener("mousedown", function () {
  if (flagsOnPaddle) {
    shootFromFlags();
  }
});

document.addEventListener("keydown", function (e) {
  if (rocketOnPaddle && !rocketFired && e.code === "ArrowUp") {
    rocketFired = true;
    rocketOnPaddle = false;
    rocket = {
      x: paddleX + paddleWidth / 2 - 2,
      y: canvas.height - paddleHeight - 15,
      dy: -8
    };
    // (rook kan hier toegevoegd worden later)
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
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * brickWidth;
        const brickY = r * brickHeight;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.drawImage(blockImg, brickX, brickY, brickWidth, brickHeight);
      }
    }
  }
}

if (rocketFired && rocket) {
  ctx.fillStyle = "red";
  ctx.fillRect(rocket.x, rocket.y, 4, 15);
  rocket.y += rocket.dy;

  spawnRocketSmoke(rocket.x, rocket.y + 15); // rook
  drawRocketSmoke();                         // rook tekenen

  checkRocketHit();                          // botsing
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


function drawPaddleFlags() {
  if (flagsOnPaddle && Date.now() - flagTimer < 20000) {
    ctx.drawImage(vlagImgLeft, paddleX - 5, canvas.height - paddleHeight - 40, 45, 45);
    ctx.drawImage(vlagImgRight, paddleX + paddleWidth - 31, canvas.height - paddleHeight - 40, 45, 45);
  } else if (flagsOnPaddle && Date.now() - flagTimer >= 20000) {
    flagsOnPaddle = false;
  }
}

function drawRocketBlock() {
  if (rocketBlock.active) {
    ctx.fillStyle = "blue";
    ctx.fillRect(rocketBlock.x + 10, rocketBlock.y + 10, brickWidth - 20, brickHeight - 20);
  }
}

function spawnRocketSmoke(x, y) {
  for (let i = 0; i < 3; i++) {
    rocketSmokeParticles.push({
      x: x + (Math.random() * 6 - 3),
      y: y + 10,
      radius: Math.random() * 4 + 2,
      alpha: 1,
      dy: Math.random() * -0.5 - 0.5
    });
  }
}

function drawRocketSmoke() {
  for (let i = 0; i < rocketSmokeParticles.length; i++) {
    const p = rocketSmokeParticles[i];
    ctx.beginPath();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = "gray";
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    p.y += p.dy;
    p.alpha -= 0.02;
  }
  
function drawExplosion() {
  for (let i = 0; i < rocketExplosionParticles.length; i++) {
    const p = rocketExplosionParticles[i];
    ctx.beginPath();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    p.x += p.dx;
    p.y += p.dy;
    p.alpha -= 0.03;
  }

  rocketExplosionParticles = rocketExplosionParticles.filter(p => p.alpha > 0);
}

  rocketSmokeParticles = rocketSmokeParticles.filter(p => p.alpha > 0);
}


function shootFromFlags() {
  const coinSpeed = 8;

  // Linkervlag
  flyingCoins.push({
    x: paddleX - 5 + 12,
    y: canvas.height - paddleHeight - 40,
    dy: -coinSpeed,
    active: true
  });

  // Rechtervlag
  flyingCoins.push({
    x: paddleX + paddleWidth - 19 + 12,
    y: canvas.height - paddleHeight - 40,
    dy: -coinSpeed,
    active: true
  });
}
function checkFlyingCoinHits() {
  flyingCoins.forEach((coin) => {
    if (!coin.active) return;

    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b.status === 1 &&
            coin.x > b.x &&
            coin.x < b.x + brickWidth &&
            coin.y > b.y &&
            coin.y < b.y + brickHeight) {
          b.status = 0;
          coin.active = false;    
          score += 10;
          document.getElementById("scoreDisplay").textContent = "score " + score + " pxp.";
          return; 
        }
      }
    }
  });
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

function collisionDetection() {

function checkRocketHit() {
  if (!rocket || rocketFired === false) return;

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (
        b.status === 1 &&
        rocket.x > b.x &&
        rocket.x < b.x + brickWidth &&
        rocket.y > b.y &&
        rocket.y < b.y + brickHeight
      ) {
        // vernietig 4 blokken in de breedte (rond impactpunt)
        for (let i = -2; i <= 1; i++) {
          const col = c + i;
          if (col >= 0 && col < brickColumnCount) {
            bricks[col][r].status = 0;
          }
        }

        // spawn explosie
        spawnExplosion(rocket.x, rocket.y);

        // reset raket
        rocket = null;
        rocketFired = false;
        return;
      }
    }
  }
}

        
function spawnExplosion(x, y) {
  for (let i = 0; i < 30; i++) {
    rocketExplosionParticles.push({
      x: x,
      y: y,
      dx: Math.random() * 4 - 2,
      dy: Math.random() * 4 - 2,
      radius: Math.random() * 4 + 2,
      color: Math.random() > 0.5 ? "orange" : "red",
      alpha: 1
    });
  }
}

        // optie: spawn explosie
        rocket = null;
        rocketFired = false;
        return;
      }
    }
  }
}

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
  
if (
  rocketBlock.active &&
  x > rocketBlock.x &&
  x < rocketBlock.x + brickWidth &&
  y > rocketBlock.y &&
  y < rocketBlock.y + brickHeight
) {
  rocketBlock.active = false;
  rocketOnPaddle = true;
  score += 20;
  document.getElementById("scoreDisplay").textContent = "score " + score + " pxp.";
}

  
  if (powerBlock.active && powerBlock.visible) {
  if (
    x > powerBlock.x &&
    x < powerBlock.x + powerBlock.width &&
    y > powerBlock.y &&
    y < powerBlock.y + powerBlock.height
  ) {
    dy = -dy;
    powerBlock.active = false;
    powerBlock.visible = false;
    clearInterval(blinkInterval); 
    powerBlockUsed = true;
    flagsOnPaddle = true;
    flagTimer = Date.now();
    powerBlockHitTime = Date.now(); 

     if (bricks[powerBlockCol] && bricks[powerBlockCol][powerBlockRow]) {
        bricks[powerBlockCol][powerBlockRow].status = 0;
      }

      score += 10;
      document.getElementById("scoreDisplay").textContent = "score " + score + " pxp.";

    
    }
  }
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

function drawFlyingCoins() {
  flyingCoins.forEach((coin) => {
    if (coin.active) {
      ctx.drawImage(shootCoinImg, coin.x - 12, coin.y - 12, 24, 24);
      coin.y += coin.dy;
    }
  });
  
  flyingCoins = flyingCoins.filter(coin => coin.y > -24 && coin.active);
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
  placeRocketBlock();
}

function placeRocketBlock() {
  const randCol = Math.floor(Math.random() * brickColumnCount);
  const randRow = Math.floor(Math.random() * brickRowCount);
  rocketBlock = {
    x: randCol * brickWidth,
    y: randRow * brickHeight,
    col: randCol,
    row: randRow,
    active: true
  };
}




const powerBlockImg = new Image();
powerBlockImg.src = "power_block_logo.png";

let powerBlock = {
  x: 0,
  y: 0,
  width: brickWidth,
  height: brickHeight,
  active: false,
  visible: true
};

let powerBlockTimer = 0;
let powerBlockInterval = 10000;
let powerBlockHit = false;
let blinkInterval;
let powerBlockRow = 0;
let powerBlockCol = 0;


function spawnPowerBlock() {
  const randCol = Math.floor(Math.random() * brickColumnCount);
  const randRow = Math.floor(Math.random() * brickRowCount);
  powerBlockCol = randCol;
  powerBlockRow = randRow;
  powerBlock.x = randCol * brickWidth;
  powerBlock.y = randRow * brickHeight;
  powerBlock.active = true;
  powerBlock.visible = true;

  clearInterval(blinkInterval);
  blinkInterval = setInterval(() => {
    if (powerBlock.active) {
      powerBlock.visible = !powerBlock.visible;
    } else {
      clearInterval(blinkInterval);
    }
  }, 300); 
}

   function startPowerBlockJumping() {
  setInterval(() => {
    if (powerBlock.active) {
      spawnPowerBlock(); // Verspring elke 15 seconden
    }
  }, 25000);
}



function drawPowerBlock() {
  if (powerBlock.active && powerBlock.visible) {
    ctx.drawImage(powerBlockImg, powerBlock.x, powerBlock.y, powerBlock.width, powerBlock.height);
  }
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionDetection();
  drawCoins();
  checkCoinCollision();
  drawBricks();
  drawPowerBlock();
  drawRocketBlock();
  drawBall();
  drawPaddle();
  drawPaddleFlags();
  drawFlyingCoins();
  checkFlyingCoinHits();
  drawExplosion();


  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  if (ballLaunched) {
    x += dx;
    y += dy;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;

    if (y + dy > canvas.height - paddleHeight - ballRadius && x > paddleX && x < paddleX + paddleWidth) {
      const hitPos = (x - paddleX) / paddleWidth; // 0 = links, 1 = rechts
      const angle = (hitPos - 0.5) * Math.PI / 2; // van -45° tot 45°
      const speed = Math.sqrt(dx * dx + dy * dy);
      dx = speed * Math.sin(angle);
      dy = -Math.abs(speed * Math.cos(angle)); // omhoog
    if (powerBlockHit) {
      spawnPowerBlock();
      powerBlockHit = false;
    }

}

    if (y + dy > canvas.height - ballRadius) {
      saveHighscore();
      ballLaunched = false;
      dx = 4;
      dy = -4;
      elapsedTime = 0;
      timerRunning = false;
      clearInterval(timerInterval);
      flagsOnPaddle = false;    // vlaggetjes verdwijnen
      flyingCoins = []; 
    }

    
if (rocketOnPaddle && !rocketFired) {
  ctx.fillStyle = "red";
  ctx.fillRect(paddleX + paddleWidth / 2 - 5, canvas.height - paddleHeight - 15, 10, 15);
}
    
if (rocketFired && rocket) {
  ctx.fillStyle = "red";
  ctx.fillRect(rocket.x, rocket.y, 4, 15);
  rocket.y += rocket.dy;

  // Rookspoor
  spawnRocketSmoke(rocket.x, rocket.y);
  drawRocketSmoke();

  // Check botsing met bricks
  checkRocketHit();
}

    
  } else {
    x = paddleX + paddleWidth / 2 - ballRadius;
    resetBricks();
    y = canvas.height - paddleHeight - ballRadius * 2;
  }

  
  if (Date.now() - powerBlockTimer > powerBlockInterval && !powerBlock.active && ballLaunched && !powerBlockUsed) {
  spawnPowerBlock();
  powerBlockTimer = Date.now();
}

  if (
  powerBlockHitTime &&
  Date.now() - powerBlockHitTime > powerBlockRespawnTime
) {
  spawnPowerBlock();
  powerBlockUsed = false;
  powerBlockHitTime = null;
}


  requestAnimationFrame(draw);
}

let imagesLoaded = 0;
function onImageLoad() {
  imagesLoaded++;
  if (imagesLoaded === 3) {
    x = paddleX + paddleWidth / 2 - ballRadius;
    y = canvas.height - paddleHeight - ballRadius * 2
    ;startPowerBlockJumping(); 
    draw();
  }
}

document.addEventListener("mousedown", function () {
  if (flagsOnPaddle) {
    shootFromFlags();
  }
});

blockImg.onload = onImageLoad;
ballImg.onload = onImageLoad;
powerBlockImg.onload = onImageLoad;
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

  // ✅ PowerBlock reset toevoegen:
  powerBlockUsed = false;
  powerBlockHitTime = null;
  powerBlock.active = false;
  powerBlock.visible = false;
  clearInterval(blinkInterval);
      
      
  flagsOnPaddle = false;
  flyingCoins = [];
  
}
    
    ballMoving = true;
  } 
});

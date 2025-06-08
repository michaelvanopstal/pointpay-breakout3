
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
let powerBlock2Timer = 0;
let powerBlock2Interval = 15000; // verschijnt om de 15 seconden
let blinkInterval2;
let powerBlock2Row = 0;
let powerBlock2Col = 0;
let powerBlock2RespawnDelay = 20000; // 20 seconden na raken terug
let powerBlock2HitTime = null;
let rocketFired = false;
let rocketSpeed = 10;
let smokeParticles = [];
let explosions = [];



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
const powerBlock2Img = new Image();
powerBlock2Img.src = "signalblock2.png";
powerBlock2Img.onload = onImageLoad;
const rocketImg = new Image();
rocketImg.src = "raket1.png";

et rocketAmmo = 0; // speler kan max 3 raketten schieten als powerBlock2 geraakt is
let rocketX = 0;
let rocketY = 0;

  
let powerBlock2 = {
  x: 0,
  y: 0,
  width: brickWidth,
  height: brickHeight,
  active: false,
  visible: true
};


document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
 
  if ((e.key === "ArrowUp" || e.key === "Up") && !ballLaunched) {
    ballLaunched = true;
    dx = 0;
    dy = -4;
    if (!timerRunning) startTimer();
    score = 0;
    document.getElementById("scoreDisplay").textContent = "score 0 pxp.";
  }

  if ((e.code === "ArrowUp" || e.code === "Space") && rocketActive && !rocketFired) {
  rocketFired = true;
  rocketAmmo--;
}

  if (flagsOnPaddle && (e.code === "Space" || e.code === "ArrowUp")) {
    shootFromFlags();
  }

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
      document.getElementById("scoreDisplay").textContent = "score " + score + " pxp.";
      document.getElementById("timeDisplay").textContent = "time 00:00";

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

function resetBall() {
  x = paddleX + paddleWidth / 2 - ballRadius;
  y = canvas.height - paddleHeight - ballRadius * 2;
}

function resetPaddle() {
  paddleX = (canvas.width - paddleWidth) / 2;
}


function drawPaddleFlags() {
  if (flagsOnPaddle && Date.now() - flagTimer < 20000) {
    ctx.drawImage(vlagImgLeft, paddleX - 5, canvas.height - paddleHeight - 40, 45, 45);
    ctx.drawImage(vlagImgRight, paddleX + paddleWidth - 31, canvas.height - paddleHeight - 40, 45, 45);
  } else if (flagsOnPaddle && Date.now() - flagTimer >= 20000) {
    flagsOnPaddle = false;
  }
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

  
  if (powerBlock2.active && powerBlock2.visible) {
    if (
      x > powerBlock2.x &&
      x < powerBlock2.x + powerBlock2.width &&
      y > powerBlock2.y &&
      y < powerBlock2.y + powerBlock2.height
    ) {
      dy = -dy;
      powerBlock2.active = false;
      powerBlock2.visible = false;
      clearInterval(blinkInterval2);
      powerBlock2HitTime = Date.now();

      score += 20;
      rocketActive = true;
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
function checkRocketCollision() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1 &&
          rocketX + 12 > b.x &&
          rocketX + 12 < b.x + brickWidth &&
          rocketY < b.y + brickHeight &&
          rocketY + 48 > b.y) {

        // vernietig max 4 blokjes (center + links + rechts + onder)
        const targets = [
          [c, r],
          [c - 1, r],
          [c + 1, r],
          [c, r + 1]
        ];

        targets.forEach(([col, row]) => {
          if (
            col >= 0 && col < brickColumnCount &&
            row >= 0 && row < brickRowCount &&
            bricks[col][row].status === 1
          ) {
            bricks[col][row].status = 0;
            score += 10;
          }
        });

        document.getElementById("scoreDisplay").textContent = "score " + score + " pxp.";
        rocketFired = false;
        rocketActive = false;
       
        explosions.push({
          x: rocketX + 12,
          y: rocketY,
          radius: 10,
          alpha: 1
         
        });
        
        return; 
      }
    }
  }
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


function spawnPowerBlock2() {
  const randCol = Math.floor(Math.random() * brickColumnCount);
  const randRow = Math.floor(Math.random() * brickRowCount);
  powerBlock2Col = randCol;
  powerBlock2Row = randRow;
  powerBlock2.x = randCol * brickWidth;
  powerBlock2.y = randRow * brickHeight;
  powerBlock2.active = true;
  powerBlock2.visible = true;

  clearInterval(blinkInterval2);
  blinkInterval2 = setInterval(() => {
    if (powerBlock2.active) {
      powerBlock2.visible = !powerBlock2.visible;
    } else {
      clearInterval(blinkInterval2);
    }
  }, 500); // knipper elke 500ms
}



function drawPowerBlock() {
  if (powerBlock.active && powerBlock.visible) {
    ctx.drawImage(powerBlockImg, powerBlock.x, powerBlock.y, powerBlock.width, powerBlock.height);
  }
}

function drawPowerBlock2() {
  if (powerBlock2.active && powerBlock2.visible) {
    ctx.drawImage(
      powerBlock2Img,
      powerBlock2.x + brickWidth * 0.05,
      powerBlock2.y + brickHeight * 0.05,
      brickWidth * 0.9,
      brickHeight * 0.9
    );
  }
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionDetection();
  drawCoins();
  checkCoinCollision();
  drawBricks();
  drawPowerBlock();
  drawPowerBlock2();
  drawBall();
  drawPaddle();
  drawPaddleFlags();
  drawFlyingCoins();
  checkFlyingCoinHits();

  
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
  
  if (
    powerBlock2HitTime &&
    Date.now() - powerBlock2HitTime > powerBlock2RespawnDelay
  ) {
    spawnPowerBlock2();
    powerBlock2HitTime = null;
  }
  
 if (rocketActive && !rocketFired) {
  // Volgt paddle, nog niet afgevuurd
  rocketX = paddleX + paddleWidth / 2 - 12;
  rocketY = canvas.height - paddleHeight - 48;
  ctx.drawImage(rocketImg, rocketX, rocketY, 30, 65);
} else if (rocketFired) {
  rocketY -= rocketSpeed;

  // Voeg rookdeeltje toe
  smokeParticles.push({
    x: rocketX + 15, // iets onder midden raket
    y: rocketY + 65, // onderkant raket
    radius: Math.random() * 6 + 4,
    alpha: 1
  });

if (rocketY < -48) {
  rocketFired = false;
  rocketActive = false; // éénmalige raket
} else {
   ctx.drawImage(rocketImg, rocketX, rocketY, 30, 65);
  checkRocketCollision(); // botst met blokjes  
  
  }
}

// 🔥 Explosies tekenen
explosions.forEach(e => {
  ctx.beginPath();
  ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 165, 0, ${e.alpha})`; // oranje explosie
  ctx.fill();
  e.radius += 2;       // explosie wordt groter
  e.alpha -= 0.05;     // en vervaagt
});

explosions = explosions.filter(e => e.alpha > 0); // alleen zichtbare explosies blijven

// 🚀 Nieuwe frame tekenen
requestAnimationFrame(draw);

  
  smokeParticles.forEach(p => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(150, 150, 150, ${p.alpha})`;
  ctx.fill();
  p.y += 1;
  p.radius += 0.3;
  p.alpha -= 0.02;
});
  
smokeParticles = smokeParticles.filter(p => p.alpha > 0);

}


let imagesLoaded = 0; 

function onImageLoad() {
  imagesLoaded++;
  console.log("Afbeelding geladen:", imagesLoaded); // ← mag hier

  if (imagesLoaded === 5) {
    x = paddleX + paddleWidth / 2 - ballRadius;
    y = canvas.height - paddleHeight - ballRadius * 2;
    startPowerBlockJumping();
    spawnPowerBlock2();
    draw();
  }
}


// Koppel alle images aan onImageLoad
blockImg.onload = onImageLoad;
ballImg.onload = onImageLoad;
powerBlockImg.onload = onImageLoad;
powerBlock2Img.onload = onImageLoad;
rocketImg.onload = onImageLoad;

document.addEventListener("mousedown", function () {
  if (rocketActive && !rocketFired) {
    rocketFired = true;  
    rocketAmmo--;
  } else if (flagsOnPaddle) {
    shootFromFlags();
  }
});


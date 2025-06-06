// [Bestaande game.js code hierboven behouden]

// --- NIEUWE VARIABELEN VOOR VLAG- EN BONUSLOGICA ---
const overlayImg = new Image();
overlayImg.src = "assets/logo_tint.png";
const vlagLeftImg = new Image();
vlagLeftImg.src = "assets/vlaggetje.png";
const vlagRightImg = new Image();
vlagRightImg.src = "assets/vlaggetje_2.png";

let overlayActive = false;
let overlayPos = { c: 0, r: 0 };
let overlayBlink = false;
let overlayTimer = 0;
let vlaggetjesFalling = [];
let paddleFlags = [];
let bonusActive = false;
let bonusTimer = 0;
let firedCoins = [];

// --- HULPFUNCTIE VOOR OVERLAY ---
function activateOverlay() {
  const c = Math.floor(Math.random() * brickColumnCount);
  const r = Math.floor(Math.random() * brickRowCount);
  overlayPos = { c, r };
  overlayActive = true;
  overlayBlink = true;
  overlayTimer = 0;
}

// --- TEKENEN VAN OVERLAY ---
function drawOverlayBlink() {
  if (overlayActive && bricks[overlayPos.c][overlayPos.r].status === 1 && overlayBlink) {
    const bx = overlayPos.c * brickWidth;
    const by = overlayPos.r * brickHeight;
    ctx.drawImage(overlayImg, bx, by, brickWidth, brickHeight);
  }
}

// --- VLAGGETJES FALLEN NA RAAKTE OVERLAY ---
function spawnVlaggetjes(x, y) {
  vlaggetjesFalling.push({ x: x - 15, y, vx: 0, vy: 2, side: 'left' });
  vlaggetjesFalling.push({ x: x + brickWidth - 15, y, vx: 0, vy: 2, side: 'right' });
}

function drawFallingVlaggetjes() {
  vlaggetjesFalling.forEach(v => {
    ctx.drawImage(v.side === 'left' ? vlagLeftImg : vlagRightImg, v.x, v.y, 30, 30);
    v.y += v.vy;

    // Collision met paddle
    if (
      v.y + 30 >= canvas.height - paddleHeight &&
      v.x + 30 > paddleX &&
      v.x < paddleX + paddleWidth
    ) {
      paddleFlags.push({ side: v.side });
      vlaggetjesFalling = vlaggetjesFalling.filter(f => f !== v);
      if (!bonusActive) {
        bonusActive = true;
        bonusTimer = 1200; // 20 seconden bij 60fps
      }
    }
  });
}

function drawPaddleFlags() {
  paddleFlags.forEach(flag => {
    const x = flag.side === 'left' ? paddleX - 15 : paddleX + paddleWidth - 15;
    ctx.drawImage(flag.side === 'left' ? vlagLeftImg : vlagRightImg, x, canvas.height - 30, 30, 30);
  });
}

// --- FIRE COINS FROM FLAGS ---
document.addEventListener("keydown", function (e) {
  if (bonusActive && e.key === "ArrowUp") {
    paddleFlags.forEach(flag => {
      const cx = flag.side === 'left' ? paddleX : paddleX + paddleWidth - 10;
      firedCoins.push({ x: cx, y: canvas.height - 40, vy: -5 });
    });
  }
});

function drawFiredCoins() {
  firedCoins.forEach(c => {
    ctx.drawImage(coinImg, c.x, c.y, 20, 20);
    c.y += c.vy;

    // Check hit op bricks
    for (let cc = 0; cc < brickColumnCount; cc++) {
      for (let rr = 0; rr < brickRowCount; rr++) {
        let b = bricks[cc][rr];
        if (b.status === 1 && c.x > b.x && c.x < b.x + brickWidth && c.y > b.y && c.y < b.y + brickHeight) {
          b.status = 0;
          score += 10;
          spawnCoin(b.x, b.y);
          document.getElementById("scoreDisplay").textContent = "score " + score + " pxp.";
          firedCoins = firedCoins.filter(fc => fc !== c);
        }
      }
    }
  });
}

// --- UPDATE OVERLAY TIMER ---
let overlayCountdown = 0;

function updateOverlayLogic() {
  overlayCountdown++;
  if (overlayCountdown > 600) { // elke 10 sec
    activateOverlay();
    overlayCountdown = 0;
  }

  overlayTimer++;
  if (overlayTimer % 30 === 0) overlayBlink = !overlayBlink;

  // Check hit
  if (overlayActive) {
    const b = bricks[overlayPos.c][overlayPos.r];
    if (
      b.status === 1 &&
      x > b.x && x < b.x + brickWidth &&
      y > b.y && y < b.y + brickHeight
    ) {
      dy = -dy;
      b.status = 0;
      overlayActive = false;
      spawnVlaggetjes(b.x, b.y);
    }
  }

  if (bonusActive) {
    bonusTimer--;
    if (bonusTimer <= 0) {
      bonusActive = false;
      paddleFlags = [];
    }
  }
}

// In draw() vóór requestAnimationFrame(draw); toevoegen:
// updateOverlayLogic();
// drawOverlayBlink();
// drawFallingVlaggetjes();
// drawPaddleFlags();
// drawFiredCoins();

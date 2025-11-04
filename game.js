
// -------------------- BASIS --------------------
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

window.onload = () => {
  img.src = 'knight.png';
};


// configuratie voor jouw poppetje
const config = {
  // ogen (positie uit jouw plaatje, moet je evt. finetunen)
  leftEye:  { x: 320, y: 360, pupilR: 8 },
  rightEye: { x: 392, y: 360, pupilR: 8 },

  // waar hij naar moet kijken (punt van zwaard)
  swordTip: { x: 700, y: 40 },

  // uitsnede van zwaard in de originele afbeelding
  swordCrop: { x: 540, y: 0, w: 220, h: 280 },

  // pivot van zwaard binnen die uitsnede (hand)
  swordPivotInCrop: { x: 30, y: 180 },

  // tijden van de animatie
  timings: {
    lookDuration: 700,
    holdAfterLook: 300,
    swingCount: 3,
    swingDurationEach: 280,
    restDuration: 500
  }
};

let imgLoaded = false;
let offSwordCanvas = null;
let coverSwordBBox = null;

// animatie-state
let startTime = 0;
let sequence = [];
let currentSwordAngle = 0;
let pupilOffsets = { L:{x:0,y:0}, R:{x:0,y:0} };

// -------------------- INIT --------------------
img.onload = function() {
  imgLoaded = true;
  prepareSword();
  buildSequence(0);
  startTime = performance.now();
  requestAnimationFrame(draw);
};

function prepareSword() {
  const sc = config.swordCrop;
  const c = document.createElement('canvas');
  c.width = sc.w;
  c.height = sc.h;
  const cx = c.getContext('2d');
  cx.drawImage(img, sc.x, sc.y, sc.w, sc.h, 0, 0, sc.w, sc.h);
  offSwordCanvas = c;

  // vlak dat we over het originele zwaard tekenen
  coverSwordBBox = {
    x: sc.x - 6,
    y: sc.y - 6,
    w: sc.w + 12,
    h: sc.h + 12
  };
}

function buildSequence(start) {
  const t = config.timings;
  sequence = [];
  let time = 0;

  // 1. kijken naar zwaard
  sequence.push({ name: 'look', t0: time, t1: time + t.lookDuration });
  time += t.lookDuration;

  // 2. blik even vasthouden
  sequence.push({ name: 'holdLook', t0: time, t1: time + t.holdAfterLook });
  time += t.holdAfterLook;

  // 3. aantal slagen
  for (let i = 0; i < t.swingCount; i++) {
    sequence.push({ name: 'swing', idx: i, t0: time, t1: time + t.swingDurationEach });
    time += t.swingDurationEach;
  }

  // 4. terug omhoog
  sequence.push({ name: 'rest', t0: time, t1: time + t.restDuration });
  time += t.restDuration;

  sequence.total = time;
  sequence.start = start;
}

// -------------------- DRAW LOOP --------------------
function draw(timestamp) {
  if (!imgLoaded) {
    requestAnimationFrame(draw);
    return;
  }

  const elapsed = timestamp - startTime;
  const loopTime = elapsed % sequence.total; // zodat hij blijft loopen

  // basis tekenen
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const { phase, prog } = getPhase(loopTime);

  // schaal van bron naar canvas (we schalen de hele afbeelding naar 800x800)
  const sx = canvas.width / img.width;
  const sy = canvas.height / img.height;

  const swordTipCanvas = { x: config.swordTip.x * sx, y: config.swordTip.y * sy };

  if (phase) {
    if (phase.name === 'look') {
      // ogen bewegen naar zwaard
      const targetOff = computePupilOffsetsForTarget(swordTipCanvas.x, swordTipCanvas.y, 8, sx, sy);
      pupilOffsets.L.x = lerp(0, targetOff.L.x, easeOutCubic(prog));
      pupilOffsets.L.y = lerp(0, targetOff.L.y, easeOutCubic(prog));
      pupilOffsets.R.x = lerp(0, targetOff.R.x, easeOutCubic(prog));
      pupilOffsets.R.y = lerp(0, targetOff.R.y, easeOutCubic(prog));
      drawEyes(pupilOffsets, sx, sy);
    }
    else if (phase.name === 'holdLook') {
      pupilOffsets = computePupilOffsetsForTarget(swordTipCanvas.x, swordTipCanvas.y, 8, sx, sy);
      drawEyes(pupilOffsets, sx, sy);
    }
    else if (phase.name === 'swing') {
      // originele zwaard wegwerken
      ctx.fillStyle = '#000';
      ctx.fillRect(
        coverSwordBBox.x * sx,
        coverSwordBBox.y * sy,
        coverSwordBBox.w * sx,
        coverSwordBBox.h * sy
      );

      // hoek van het zwaard berekenen
      const swingIndex = phase.idx;
      const maxAngle = degToRad(28) * (1 - swingIndex * 0.12);
      const angle = Math.sin(prog * Math.PI) * ( (swingIndex % 2 === 0) ? -maxAngle : maxAngle );
      currentSwordAngle = angle;

      // zwaard tekenen
      drawRotatedSword(currentSwordAngle, sx, sy);

      // ogen laten volgen
      const tipRot = getRotatedSwordTip(currentSwordAngle, sx, sy);
      const pOff = computePupilOffsetsForTarget(tipRot.x, tipRot.y, 9, sx, sy);
      drawEyes(pOff, sx, sy);
    }
    else if (phase.name === 'rest') {
      // originele zwaard weg
      ctx.fillStyle = '#000';
      ctx.fillRect(
        coverSwordBBox.x * sx,
        coverSwordBBox.y * sy,
        coverSwordBBox.w * sx,
        coverSwordBBox.h * sy
      );
      // zwaard terug naar 0
      const angle = lerp(currentSwordAngle, 0, easeOutCubic(prog));
      drawRotatedSword(angle, sx, sy);

      // ogen terug naar neutraal
      pupilOffsets.L.x = lerp(pupilOffsets.L.x, 0, prog);
      pupilOffsets.L.y = lerp(pupilOffsets.L.y, 0, prog);
      pupilOffsets.R.x = lerp(pupilOffsets.R.x, 0, prog);
      pupilOffsets.R.y = lerp(pupilOffsets.R.y, 0, prog);
      drawEyes(pupilOffsets, sx, sy);
    }
  } else {
    // fallback
    drawEyes({L:{x:0,y:0},R:{x:0,y:0}}, sx, sy);
  }

  requestAnimationFrame(draw);
}

// -------------------- HELPERS --------------------
function getPhase(localTime) {
  for (const ph of sequence) {
    if (localTime >= ph.t0 && localTime < ph.t1) {
      return { phase: ph, prog: (localTime - ph.t0) / (ph.t1 - ph.t0) };
    }
  }
  return { phase: null, prog: 0 };
}

function drawEyes(p, sx, sy) {
  const L = config.leftEye;
  const R = config.rightEye;
  // linker pupil
  ctx.beginPath();
  ctx.fillStyle = '#000';
  ctx.arc(L.x * sx + p.L.x, L.y * sy + p.L.y, L.pupilR * ((sx+sy)/2), 0, Math.PI*2);
  ctx.fill();
  // rechter pupil
  ctx.beginPath();
  ctx.fillStyle = '#000';
  ctx.arc(R.x * sx + p.R.x, R.y * sy + p.R.y, R.pupilR * ((sx+sy)/2), 0, Math.PI*2);
  ctx.fill();
}

function drawRotatedSword(angle, sx, sy) {
  if (!offSwordCanvas) return;
  const pivot = {
    x: (config.swordCrop.x + config.swordPivotInCrop.x) * sx,
    y: (config.swordCrop.y + config.swordPivotInCrop.y) * sy
  };
  const w = offSwordCanvas.width * sx;
  const h = offSwordCanvas.height * sy;

  ctx.save();
  ctx.translate(pivot.x, pivot.y);
  ctx.rotate(angle);
  ctx.drawImage(
    offSwordCanvas,
    0, 0, offSwordCanvas.width, offSwordCanvas.height,
    -config.swordPivotInCrop.x * sx,
    -config.swordPivotInCrop.y * sy,
    w, h
  );
  ctx.restore();
}

function getRotatedSwordTip(angle, sx, sy) {
  const pivot = {
    x: (config.swordCrop.x + config.swordPivotInCrop.x) * sx,
    y: (config.swordCrop.y + config.swordPivotInCrop.y) * sy
  };
  const tipRel = {
    x: (config.swordCrop.w - config.swordPivotInCrop.x) * sx,
    y: (0 - config.swordPivotInCrop.y) * sy
  };
  return {
    x: pivot.x + (tipRel.x * Math.cos(angle) - tipRel.y * Math.sin(angle)),
    y: pivot.y + (tipRel.x * Math.sin(angle) + tipRel.y * Math.cos(angle))
  };
}

function computePupilOffsetsForTarget(tx, ty, max, sx, sy) {
  const Lc = { x: config.leftEye.x * sx, y: config.leftEye.y * sy };
  const Rc = { x: config.rightEye.x * sx, y: config.rightEye.y * sy };

  function off(eye) {
    const dx = tx - eye.x;
    const dy = ty - eye.y;
    const ang = Math.atan2(dy, dx);
    return { x: Math.cos(ang)*max, y: Math.sin(ang)*max };
  }

  return { L: off(Lc), R: off(Rc) };
}

function lerp(a,b,t){ return a + (b-a)*t; }
function degToRad(d){ return d * Math.PI / 180; }
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }



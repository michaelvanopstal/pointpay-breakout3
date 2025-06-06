
if (powerBlock.active && powerBlock.visible) {
  if (
    x > powerBlock.x &&
    x < powerBlock.x + powerBlock.width &&
    y > powerBlock.y &&
    y < powerBlock.y + powerBlock.height
  ) {
    dy = -dy;
    powerBlock.active = false;
    powerBlockHit = true;

    // Verwijder ook de brick eronder
    if (bricks[powerBlockCol] && bricks[powerBlockCol][powerBlockRow]) {
      bricks[powerBlockCol][powerBlockRow].status = 0;
    }

    score += 10;
    document.getElementById("scoreDisplay").textContent = "score " + score + " pxp.";
  }
}

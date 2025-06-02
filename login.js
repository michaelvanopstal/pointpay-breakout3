function submitName() {
  const nameInput = document.getElementById("player-name");
  const playerName = nameInput.value.trim();
  if (playerName) {
    document.getElementById("player-display").innerText = `Player ${playerName}`;
    document.getElementById("login-overlay").style.display = "none";
    window.playerName = playerName;
    if (typeof renderHighscores === 'function') renderHighscores();
  } else {
    alert("Voer een geldige naam in.");
  }
}

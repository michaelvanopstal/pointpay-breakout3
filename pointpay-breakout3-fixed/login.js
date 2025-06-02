function submitName() {
  const nameInput = document.getElementById("player-name");
  const playerName = nameInput.value.trim();
  if (playerName) {
    document.getElementById("player-display").innerText = `Player: ${playerName}`;
    document.getElementById("login-block").style.display = "none";
    // Game kan hier starten indien nodig
  } else {
    alert("Voer een geldige naam in.");
  }
}

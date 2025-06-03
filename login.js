function submitName() {
  const playerName = document.getElementById("player-name").value.trim();
  if (playerName !== "") {
    window.currentPlayer = playerName;
    document.getElementById("player-display").textContent = "Player: " + playerName;
    document.getElementById("login-overlay").style.display = "none";
    // Zet klaar om spel te starten, maar start nog NIET automatisch
    window.readyToLaunch = true;
  } else {
    alert("Vul je naam in om te starten.");
  }
}

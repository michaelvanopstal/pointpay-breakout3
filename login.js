function submitName() {
  const playerName = document.getElementById("player-name").value.trim();
  if (playerName !== "") {
    window.currentPlayer = playerName;
    localStorage.setItem("currentPlayer", playerName);
    document.getElementById("player-display").textContent = "Player: " + playerName;
    document.getElementById("login-overlay").style.display = "none";
    document.getElementById("logout-button").style.display = "inline-block";
    window.readyToLaunch = true;
  } else {
    alert("Vul je naam in om te starten.");
  }
}

function logoutPlayer() {
  window.currentPlayer = null;
  localStorage.removeItem("currentPlayer");
  document.getElementById("player-display").textContent = "Player";
  document.getElementById("logout-button").style.display = "none";
  document.getElementById("login-overlay").style.display = "block";
  window.readyToLaunch = false;
}

window.onload = function () {
  const savedName = localStorage.getItem("currentPlayer");
  if (savedName) {
    window.currentPlayer = savedName;
    document.getElementById("player-display").textContent = "Player: " + savedName;
    document.getElementById("login-overlay").style.display = "none";
    document.getElementById("logout-button").style.display = "inline-block";
    window.readyToLaunch = true;
  } else {
    document.getElementById("logout-button").style.display = "none";
  }
};


document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("playerName");
  const display = document.getElementById("playerNameDisplay");

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim() !== "") {
      const playerName = input.value.trim();
      display.textContent = "Player: " + playerName;
      document.getElementById("loginContainer").style.display = "none";
    }
  });
});

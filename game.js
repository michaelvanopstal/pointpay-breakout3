
function showRestartButton() {
  const button = document.createElement("button");
  button.textContent = "Speel opnieuw";
  button.style.position = "absolute";
  button.style.top = "50%";
  button.style.left = "50%";
  button.style.transform = "translate(-50%, -50%)";
  button.style.padding = "10px 20px";
  button.style.fontSize = "18px";
  button.style.zIndex = "1000";
  button.onclick = () => location.reload();
  document.body.appendChild(button);
}

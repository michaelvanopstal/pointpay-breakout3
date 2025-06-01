
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "blue";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "white";
ctx.font = "24px Arial";
ctx.fillText("PointPay Breakout 3", 250, 300);

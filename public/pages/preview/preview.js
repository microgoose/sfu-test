import { createRandomBallCanvasAnimation } from "/js/canvas/random-ball-animation.js";

const previewCanvas = document.getElementById("preview-canvas");
const confirmButton = document.getElementById("confirm-button");

const roomId = new URLSearchParams(window.location.search).get("id");

if (roomId) {
    confirmButton.href = `/room?id=${encodeURIComponent(roomId)}`;
}

createRandomBallCanvasAnimation(previewCanvas);

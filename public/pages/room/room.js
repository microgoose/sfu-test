import {createVideoGridRenderer} from "./room-renderers.js";
import {createRandomBallCanvasAnimation} from "../../js/canvas/random-ball-animation.js";

const hiddenCanvas = document.getElementById("hidden-canvas");
const videoGridEl = document.getElementById("video-grid");
const roomTitleEl = document.getElementById("room-title");
const roomId = new URLSearchParams(window.location.search).get("id");

roomTitleEl.textContent = roomId ? `id=${roomId}` : "no id";

const videoGridRenderer = createVideoGridRenderer(videoGridEl);
const canvasAnimation = createRandomBallCanvasAnimation(hiddenCanvas);

document.addEventListener("DOMContentLoaded", () => {
    videoGridRenderer.addVideoSquare({
        label: "Local preview",
        stream: canvasAnimation.getStream(),
    });
});

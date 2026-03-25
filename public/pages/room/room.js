import {createVideoGridRenderer} from "./room-renderers.js";
import {createRandomBallCanvasAnimation} from "../../js/canvas/random-ball-animation.js";
import {createWsClient, MESSAGE_TYPES} from "../../js/config/ws-config.js";

const hiddenCanvas = document.getElementById("hidden-canvas");
const videoGridEl = document.getElementById("video-grid");
const roomTitleEl = document.getElementById("room-title");
const roomId = new URLSearchParams(window.location.search).get("id");

roomTitleEl.textContent = roomId ? `id=${roomId}` : "no id";

const videoGridRenderer = createVideoGridRenderer(videoGridEl);
const canvasAnimation = createRandomBallCanvasAnimation(hiddenCanvas);
const wsClient = createWsClient('ws://localhost:3000');

document.addEventListener("DOMContentLoaded", async () => {
    videoGridRenderer.addVideoSquare({
        label: "Local preview",
        stream: canvasAnimation.getStream(),
    });
});

wsClient.setRoute(MESSAGE_TYPES.CONNECT, () => {
    wsClient.joinRoom(roomId);
});

wsClient.setRoute(MESSAGE_TYPES.PARTICIPANT_JOINED, (data) => {
    console.log('Participant joined', data);
});

wsClient.setRoute(MESSAGE_TYPES.PARTICIPANT_LEFT, (data) => {
    console.log('Participant left', data);
});
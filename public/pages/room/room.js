import { createVideoGridRenderer } from "./room-renderers.js";

const videoGridEl = document.getElementById("video-grid");
const roomTitleEl = document.getElementById("room-title");
const roomId = new URLSearchParams(window.location.search).get("id");

roomTitleEl.textContent = roomId ? `id=${roomId}` : "no id";

const videoGridRenderer = createVideoGridRenderer(videoGridEl);

videoGridRenderer.addVideoSquare({
    label: "Local preview",
});

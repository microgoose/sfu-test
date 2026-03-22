export function createVideoGridRenderer(videoGridEl) {
    return {
        addVideoSquare({ label = "Video", stream = null, muted = true } = {}) {
            const cardEl = document.createElement("article");
            cardEl.className = "room-video-card";

            const videoEl = document.createElement("video");
            videoEl.className = "room-video";
            videoEl.autoplay = true;
            videoEl.playsInline = true;
            videoEl.muted = muted;

            if (stream) {
                videoEl.srcObject = stream;
                videoEl.addEventListener("loadedmetadata", () => {
                    videoEl.play().catch((error) => {
                        console.error("Video play failed:", error);
                    });
                });
            }

            const labelEl = document.createElement("span");
            labelEl.className = "room-video-label";
            labelEl.textContent = label;

            cardEl.append(videoEl, labelEl);
            videoGridEl.append(cardEl);

            return videoEl;
        },
    };
}

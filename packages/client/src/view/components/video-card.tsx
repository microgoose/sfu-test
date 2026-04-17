import {createEffect, onCleanup} from "solid-js";

interface VideoCardProps {
    stream: MediaStream;
}

export const VideoCard = (props: VideoCardProps) => {
    let videoRef!: HTMLVideoElement;

    createEffect(() => {
        const stream = props.stream;
        if (!stream || !videoRef) return;

        videoRef.srcObject = stream;
        videoRef.play().catch((error) => {
            console.error("Video play failed:", error);
        });
    });

    onCleanup(() => {
        videoRef.srcObject = null;
    });

    return (
        <video
            ref={videoRef}
            class="room-video"
            autoplay
            playsinline
            muted
        />
    );
};
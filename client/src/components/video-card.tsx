import {onMount} from "solid-js";

interface VideoCardProps {
    label: string;
    stream: MediaStream | null;
    muted?: boolean;
}

export const VideoCard = (props: VideoCardProps) => {
    let videoRef!: HTMLVideoElement;

    onMount(() => {
        if (props.stream) {
            videoRef.srcObject = props.stream;
            videoRef.play().catch((error) => {
                console.error("Video play failed:", error);
            });
        }
    });

    return (
        <article class="room-video-card">
            <video
                ref={videoRef}
                class="room-video"
                autoplay
                playsinline
                muted={props.muted ?? true}
            />
            <span class="room-video-label">{props.label}</span>
        </article>
    );
};
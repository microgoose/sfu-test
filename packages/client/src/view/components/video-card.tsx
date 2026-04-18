import {createEffect, onCleanup, Show} from "solid-js";
import {VideoCardPreview} from "@/view/components/video-card-preview";
import {Participant} from "@/domain/types";

interface VideoCardProps {
    participant: Participant
}

export const VideoCard = (props: VideoCardProps) => {
    let videoRef!: HTMLVideoElement;
    let audioRef!: HTMLAudioElement;

    createEffect(() => {
        const track = props.participant.videoTrack;
        if (!track || !videoRef) return;

        videoRef.srcObject = new MediaStream([track]);
        videoRef.play().catch((error) => {
            console.error("Video play failed:", error);
        });
    });

    createEffect(() => {
        const track = props.participant.audioTrack;
        if (!track || !audioRef) return;

        audioRef.srcObject = new MediaStream([track]);
        audioRef.play().catch((error) => {
            console.error("Audio play failed:", error);
        });
    });

    onCleanup(() => {
        videoRef.srcObject = null;
        audioRef.srcObject = null;
    });

    return (
        <>
            <Show when={props.participant.videoTrack} fallback={<VideoCardPreview name={props.participant.name}/>}>
                <video
                    ref={videoRef}
                    class="room-video"
                    autoplay
                    playsinline
                    muted
                />
            </Show>
            <audio ref={audioRef} autoplay />
        </>
    );
};
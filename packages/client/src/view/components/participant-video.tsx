import {createEffect, onCleanup, Show} from "solid-js";
import {VideoCardPreview} from "@/view/components/video-card-preview";
import {Participant} from "@/service/room-participant/participants.store";

interface VideoCardProps {
    participant: Participant;
}

export const ParticipantVideo = (props: VideoCardProps) => {
    let videoRef!: HTMLVideoElement;

    createEffect(() => {
        const track = props.participant.videoTrack;
        if (!videoRef || !track) return;

        videoRef.srcObject = new MediaStream([track]);
        videoRef.play().catch((error) => {
            console.error("Video play failed:", error);
        });
    });

    onCleanup(() => {
        if (videoRef) videoRef.srcObject = null;
    });

    return (
        <Show when={props.participant.videoTrack} fallback={<VideoCardPreview name={props.participant.name}/>}>
            <video
                ref={videoRef}
                class="room-video"
                autoplay
                playsinline
                muted
            />
        </Show>
    );
};
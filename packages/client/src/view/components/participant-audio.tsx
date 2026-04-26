import {createEffect, onCleanup} from "solid-js";

interface VideoCardProps {
    audioTrack?: MediaStreamTrack;
}

export const ParticipantAudio = (props: VideoCardProps) => {
    let audioRef!: HTMLAudioElement;

    createEffect(() => {
        const track = props.audioTrack;
        if (!track || !audioRef) return;

        audioRef.srcObject = new MediaStream([track]);
        audioRef.play().catch((error) => {
            console.error("Audio play failed:", error);
        });
    });

    onCleanup(() => {
        audioRef.srcObject = null;
    });

    return <audio ref={audioRef} autoplay />;
};
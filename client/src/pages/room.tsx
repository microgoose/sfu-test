import '../assets/css/room.css';
import { For } from "solid-js";
import { useParams } from "@solidjs/router";
import { VideoCard } from "../components/video-card";
import { useRoom } from "../service/user-room";

export const Room = () => {
    const params = useParams<{ roomId: string }>();

    let hiddenCanvasRef!: HTMLCanvasElement;

    const { videos } = useRoom({
        roomId: params.roomId,
        wsUrl: "ws://localhost:8080",
        getCanvas: () => hiddenCanvasRef,
    });

    return (
        <>
            <canvas ref={hiddenCanvasRef} class="hidden-canvas" width="300" height="300" />

            <main class="page">
                <section class="terminal-shell">
                    <header class="terminal-header">
                        <h1 class="terminal-title">Room</h1>
                        <span class="terminal-subtitle">id={params.roomId}</span>
                    </header>
                    <div class="terminal-body">
                        <div class="room-video-grid">
                            <For each={videos()}>
                                {(entry) => (
                                    <VideoCard
                                        label={entry.label}
                                        stream={entry.stream}
                                    />
                                )}
                            </For>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};
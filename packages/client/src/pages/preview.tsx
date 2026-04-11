import '../assets/css/preview.css';
import {onCleanup, onMount} from "solid-js";
import {A, useParams} from "@solidjs/router";
import {createRandomBallCanvasAnimation} from "../service/random-ball-animation";

export const Preview = () => {
    const params = useParams<{ roomId: string }>();

    let canvasRef!: HTMLCanvasElement;

    onMount(() => {
        const animation = createRandomBallCanvasAnimation(canvasRef);
        onCleanup(() => animation.stop());
    });

    return (
        <main class="page preview-page">
            <section class="terminal-shell">
                <header class="terminal-header">
                    <div>
                        <h1 class="terminal-title">Preview</h1>
                        <div class="terminal-subtitle">
                            Canvas animation is ready for future stream capture.
                        </div>
                    </div>
                </header>

                <div class="terminal-body preview-layout">
                    <div class="preview-stage">
                        <canvas
                            ref={canvasRef}
                            class="preview-canvas"
                            width="960"
                            height="540"
                            aria-label="Animated preview canvas"
                        />
                    </div>
                    <div class="preview-actions">
                        <A class="terminal-button" href={`/room/${params.roomId}`}>
                            Confirm
                        </A>
                    </div>
                </div>
            </section>
        </main>
    );
};

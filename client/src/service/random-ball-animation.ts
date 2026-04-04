export interface RandomBallOptions {
    radius: number;
    speed: number;
    backgroundColor: string;
    ballColor: string;
    glowColor: string;
    height: string;
    width: string;
}

export const RANDOM_BALL_OPTIONS: RandomBallOptions = {
    radius: 26,
    speed: 280,
    backgroundColor: "#071133",
    ballColor: "#ffd75f",
    glowColor: "rgba(255, 215, 95, 0.35)",
    height: '300px',
    width: '300px'
};

interface BallState {
    radius: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

interface AnimationState {
    animationFrameId: number | null;
    lastTimestamp: number;
    width: number | string;
    height: number | string;
    ball: BallState;
}

interface Direction {
    vx: number;
    vy: number;
}

export interface CanvasAnimation {
    canvas: HTMLCanvasElement;
    start(): void;
    stop(): void;
    getStream(frameRate?: number): MediaStream;
}

export function createRandomBallCanvasAnimation(
    canvas: HTMLCanvasElement,
    options: RandomBallOptions = RANDOM_BALL_OPTIONS
): CanvasAnimation {
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("2D canvas context is not available.");
    }

    const state: AnimationState = {
        animationFrameId: null,
        lastTimestamp: 0,
        width: canvas.width || options.width,
        height: canvas.height || options.height,
        ball: {
            radius: options.radius ?? 26,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
        },
    };

    const speed: number = options.speed ?? 280;
    const backgroundColor: string = options.backgroundColor ?? "#071133";
    const ballColor: string = options.ballColor ?? "#ffd75f";
    const glowColor: string = options.glowColor ?? "rgba(255, 215, 95, 0.35)";

    function resizeCanvas(): void {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const nextWidth = Math.max(1, Math.round(rect.width * dpr));
        const nextHeight = Math.max(1, Math.round(rect.height * dpr));

        if (canvas.width === nextWidth && canvas.height === nextHeight) {
            return;
        }

        canvas.width = nextWidth;
        canvas.height = nextHeight;
        state.width = nextWidth;
        state.height = nextHeight;
        resetBallPosition();
    }

    function randomDirection(): Direction {
        const angle = Math.random() * Math.PI * 2;

        return {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
        };
    }

    function resetBallPosition(): void {
        const { radius } = state.ball;
        const { vx, vy } = randomDirection();

        state.ball.x = (state.width as number) / 2;
        state.ball.y = (state.height as number) / 2;
        state.ball.vx = vx;
        state.ball.vy = vy;

        if ((state.width as number) <= radius * 2 || (state.height as number) <= radius * 2) {
            state.ball.x = radius;
            state.ball.y = radius;
        }
    }

    function reflectIfNeeded(): void {
        const { ball, width, height } = state;

        if (ball.x <= ball.radius) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx);
        } else if (ball.x >= (width as number) - ball.radius) {
            ball.x = (width as number) - ball.radius;
            ball.vx = -Math.abs(ball.vx);
        }

        if (ball.y <= ball.radius) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy);
        } else if (ball.y >= (height as number) - ball.radius) {
            ball.y = (height as number) - ball.radius;
            ball.vy = -Math.abs(ball.vy);
        }
    }

    function update(deltaSeconds: number): void {
        state.ball.x += state.ball.vx * deltaSeconds;
        state.ball.y += state.ball.vy * deltaSeconds;
        reflectIfNeeded();
    }

    function draw(): void {
        if (context == null)
            throw new Error('Context is null');

        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, state.width as number, state.height as number);

        context.fillStyle = ballColor;
        context.shadowColor = glowColor;
        context.shadowBlur = state.ball.radius;
        context.beginPath();
        context.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
    }

    function animate(timestamp: number): void {
        if (!state.lastTimestamp) {
            state.lastTimestamp = timestamp;
        }

        const deltaSeconds = Math.min((timestamp - state.lastTimestamp) / 1000, 0.05);
        state.lastTimestamp = timestamp;

        update(deltaSeconds);
        draw();

        state.animationFrameId = window.requestAnimationFrame(animate);
    }

    function start(): void {
        resizeCanvas();
        resetBallPosition();
        draw();
        state.animationFrameId = window.requestAnimationFrame(animate);
    }

    function stop(): void {
        if (state.animationFrameId !== null) {
            window.cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }
    }

    const handleResize = (): void => {
        resizeCanvas();
        draw();
    };

    window.addEventListener("resize", handleResize);
    start();

    return {
        canvas,
        start() {
            window.addEventListener("resize", handleResize);
            start();
        },
        stop() {
            stop();
            window.removeEventListener("resize", handleResize);
        },
        getStream(frameRate: number = 60): MediaStream {
            return canvas.captureStream(frameRate);
        },
    };
}

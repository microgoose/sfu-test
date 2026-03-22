export const RANDOM_BALL_OPTIONS = {
    radius: 26,
    speed: 280,
    backgroundColor: "#071133",
    ballColor: "#ffd75f",
    glowColor: "rgba(255, 215, 95, 0.35)",
    height: '300px',
    width: '300px'
};

export function createRandomBallCanvasAnimation(canvas, options = RANDOM_BALL_OPTIONS) {
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("2D canvas context is not available.");
    }

    const state = {
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

    const speed = options.speed ?? 280;
    const backgroundColor = options.backgroundColor ?? "#071133";
    const ballColor = options.ballColor ?? "#ffd75f";
    const glowColor = options.glowColor ?? "rgba(255, 215, 95, 0.35)";

    function resizeCanvas() {
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

    function randomDirection() {
        const angle = Math.random() * Math.PI * 2;

        return {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
        };
    }

    function resetBallPosition() {
        const {radius} = state.ball;
        const {vx, vy} = randomDirection();

        state.ball.x = state.width / 2;
        state.ball.y = state.height / 2;
        state.ball.vx = vx;
        state.ball.vy = vy;

        if (state.width <= radius * 2 || state.height <= radius * 2) {
            state.ball.x = radius;
            state.ball.y = radius;
        }
    }

    function reflectIfNeeded() {
        const {ball, width, height} = state;

        if (ball.x <= ball.radius) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx);
        } else if (ball.x >= width - ball.radius) {
            ball.x = width - ball.radius;
            ball.vx = -Math.abs(ball.vx);
        }

        if (ball.y <= ball.radius) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy);
        } else if (ball.y >= height - ball.radius) {
            ball.y = height - ball.radius;
            ball.vy = -Math.abs(ball.vy);
        }
    }

    function update(deltaSeconds) {
        state.ball.x += state.ball.vx * deltaSeconds;
        state.ball.y += state.ball.vy * deltaSeconds;
        reflectIfNeeded();
    }

    function draw() {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, state.width, state.height);

        context.fillStyle = ballColor;
        context.shadowColor = glowColor;
        context.shadowBlur = state.ball.radius;
        context.beginPath();
        context.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
    }

    function animate(timestamp) {
        if (!state.lastTimestamp) {
            state.lastTimestamp = timestamp;
        }

        const deltaSeconds = Math.min((timestamp - state.lastTimestamp) / 1000, 0.05);
        state.lastTimestamp = timestamp;

        update(deltaSeconds);
        draw();

        state.animationFrameId = window.requestAnimationFrame(animate);
    }

    function start() {
        resizeCanvas();
        resetBallPosition();
        draw();
        state.animationFrameId = window.requestAnimationFrame(animate);
    }

    function stop() {
        if (state.animationFrameId !== null) {
            window.cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }
    }

    const handleResize = () => {
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
        getStream(frameRate = 60) {
            return canvas.captureStream(frameRate);
        },
    };
}

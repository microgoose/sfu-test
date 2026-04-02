import express from "express";
import cors from 'cors';
import {HTTP_PORT} from "./src/config/server-config.js";
import {roomRouter} from "./src/routes/room-router.js";
import {createRoom} from "./src/services/rooms-service.js";
import {createServer} from "node:http";
import {createWsServer} from "./ws-server.js";
import {createWorker} from "./src/infra/mediasoup/ms-worker-service.js";

const app = express();

app.use(cors());
app.use("/api/v1/room", roomRouter);

const server = createServer(app);
createWsServer(server);

async function main() {
    await createWorker();
    await Promise.all([
        createRoom('1'),
        createRoom('2'),
        createRoom('3'),
    ])

    server.listen(HTTP_PORT, () => {
        console.log(`HTTP and WebSocket server listening on port ${HTTP_PORT}`);
    });
}

main();
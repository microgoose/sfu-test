import express from 'express';
import cors from 'cors';
import {ANNOUNCED_ADDRESS, HTTP_PORT} from "@/config/server.config.js";
import {createWorker} from "@/infra/mediasoup/adapter/worker.adapter.js";
import {createRoom} from "@/service/room.service.js";
import {httpRoomRouter} from "@/infra/routes/room.routes.js";
import {WebSocketServer} from "ws";
import {createMessagingServer} from "@/infra/messaging/messaging-server.js";

const httpServer = express();
httpServer.use(cors());
httpServer.use(express.json());
httpServer.use('/api/v1/room', httpRoomRouter);

createMessagingServer(new WebSocketServer({ port: 15674 }));

httpServer.listen(HTTP_PORT, async () => {
    await createWorker(ANNOUNCED_ADDRESS);
    await Promise.all([
        createRoom('1', 'sys')
    ]);

    console.debug(`Server listening on port ${HTTP_PORT}`);
});
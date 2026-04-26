import express from 'express';
import cors from 'cors';
import {createWorker} from "@/infra/mediasoup/adapter/worker.adapter.js";
import {createRoom} from "@/service/room.service.js";
import {httpRoomRouter} from "@/infra/routes/room.routes.js";
import {WebSocketServer} from "ws";
import {createMessagingServer} from "@/infra/messaging/messaging-server.js";
import { networkInterfaces } from 'os';

const httpServer = express();
httpServer.use(cors());
httpServer.use(express.json());
httpServer.use('/api/v1/room', httpRoomRouter);

createMessagingServer(new WebSocketServer({ port: 15674 }));

httpServer.listen(8080, async () => {
    await createWorker(getLocalIP());
    await Promise.all([
        createRoom('1', 'sys')
    ]);

    console.debug(`Server listening on port ${8080}`);
});

function getLocalIP(): string {
    const nets = networkInterfaces();

    for (const interfaces of Object.values(nets)) {
        if (!interfaces) continue;
        for (const net of interfaces) {
            // IPv4 и не loopback (не 127.0.0.1)
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }

    return '127.0.0.1'; // fallback
}
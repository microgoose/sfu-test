import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { HTTP_PORT, WS_PATH, ANNOUNCED_ADDRESS } from './config/server.config.ts';
import { createStompServer } from './infra/stomp/stomp-server.ts';
import { roomRouter } from './routes/room.routes.ts';
import { registerStompRoutes } from './routes/stomp.routes.ts';
import { createWorker } from './infra/mediasoup/worker.service.ts';
import { createRoom } from './service/room.service.ts';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/room', roomRouter);

const httpServer = createServer(app);
createStompServer(httpServer, WS_PATH);
registerStompRoutes();

async function main(): Promise<void> {
    await createWorker(ANNOUNCED_ADDRESS);

    await Promise.all([
        createRoom('1')
    ]);

    httpServer.listen(HTTP_PORT, () => {
        console.debug(`Server listening on port ${HTTP_PORT}`);
    });
}

main().catch(console.error);
import express from 'express';
import cors from 'cors';
import {createServer} from 'node:http';
import {ANNOUNCED_ADDRESS, HTTP_PORT, WS_PATH} from './config/server.config.ts';
import {createStompServer} from './infra/stomp/stomp-server.ts';
import {roomRouter} from './routes/room.routes.ts';
import {createWorker} from './infra/mediasoup/worker.service.ts';
import {createRoom} from './service/room.service.ts';
import {registerConsumerRoutes, registerProducerRoutes, registerTransportRoutes} from "./routes/transport.routes.ts";
import {registerParticipantRoutes} from "./routes/participant.routes.ts";

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/room', roomRouter);

registerParticipantRoutes();
registerTransportRoutes();
registerConsumerRoutes();
registerProducerRoutes();

const httpServer = createServer(app);
createStompServer(httpServer, WS_PATH);

async function main(): Promise<void> {
    await createWorker(ANNOUNCED_ADDRESS);

    // TODO
    await Promise.all([
        createRoom('1')
    ]);

    httpServer.listen(HTTP_PORT, () => {
        console.debug(`Server listening on port ${HTTP_PORT}`);
    });
}

main().catch(console.error);
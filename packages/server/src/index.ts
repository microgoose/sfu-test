import express from 'express';
import cors from 'cors';
import {ANNOUNCED_ADDRESS, HTTP_PORT} from './config/server.config.ts';
import {httpRoomRouter} from './routes/room.routes.ts';
import {createRoom} from './service/room.service.ts';
import {createWorker} from "@/infra/mediasoup/adapter/worker.adapter.ts";
import {saveParticipant} from "@/storage/storage.ts";
import {connectMessagingClient} from "@sfu-test/messaging";
import {client} from "@/infra/messaging/messaging-client.ts";

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/room', httpRoomRouter);

app.listen(HTTP_PORT, async () => {
    await connectMessagingClient(client);
    await createWorker(ANNOUNCED_ADDRESS);
    await Promise.all([
        createRoom('1', 'silvio')
    ]);

    saveParticipant({ id: '1', });
    saveParticipant({ id: '2', });
    saveParticipant({ id: '3', });

    console.debug(`Server listening on port ${HTTP_PORT}`);
});
import express from 'express';
import cors from 'cors';
import {connectMessagingClient} from "@sfu-test/messaging";
import {ANNOUNCED_ADDRESS, HTTP_PORT} from "@/config/server.config.js";
import {httpRoomRouter} from "@/routes/room.routes.js";
import {client} from "@/infra/messaging/messaging-client.js";
import {createWorker} from "@/infra/mediasoup/adapter/worker.adapter.js";
import {createRoom} from "@/service/room.service.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/room', httpRoomRouter);

app.listen(HTTP_PORT, async () => {
    await connectMessagingClient(client);
    await createWorker(ANNOUNCED_ADDRESS);
    await Promise.all([
        createRoom('1', 'sys')
    ]);

    console.debug(`Server listening on port ${HTTP_PORT}`);
});
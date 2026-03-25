import express from "express";
import {HTTP_PORT} from "./src/config/server-config.js";
import {roomRouter} from "./src/routes/room-router.js";
import {pageRouter} from "./src/routes/page-router.js";
import {createRoom} from "./src/services/rooms-service.js";
import {createServer} from "node:http";
import {createWsServer} from "./ws-server.js";

const app = express();

app.use(express.static("public"));
app.use("/", pageRouter);
app.use("/api/v1/room", roomRouter);

const server = createServer(app);
createWsServer(server);

server.listen(HTTP_PORT, () => {
  console.log(`HTTP and WebSocket server listening on port ${HTTP_PORT}`);
});

createRoom('1');
createRoom('2');
createRoom('3');
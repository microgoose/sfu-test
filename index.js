import express from "express";
import { HTTP_PORT } from "./src/config/server-config.js";
import { roomRouter } from "./src/routes/room-router.js";
import {pageRouter} from "./src/routes/page-router.js";
import {createRoom} from "./src/services/rooms-service.js";

const app = express();

app.use(express.static("public"));
app.use("/", pageRouter);
app.use("/api/v1/room", roomRouter);

app.listen(HTTP_PORT, () => {
  console.log(`HTTP server listening on port ${HTTP_PORT}`);
});

createRoom();
createRoom();
createRoom();
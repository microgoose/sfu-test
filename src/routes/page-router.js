import path from "path";
import {Router} from "express";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");

export const pageRouter = Router()
    .get("/", (req, res) => {
        res.redirect("/rooms");
    })
    .get("/rooms", (req, res) => {
        res.sendFile(path.join(rootDir, "public", "pages", "rooms", "rooms.html"));
    })
    .get("/room", (req, res) => {
        res.sendFile(path.join(rootDir, "public", "pages", "room", "room.html"));
    })
    .get("/preview", (req, res) => {
        res.sendFile(
            path.join(rootDir, "public", "pages", "preview", "preview.html"),
        );
    });
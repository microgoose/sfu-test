import { Router } from "express";
import * as roomService from "../services/rooms-service.js";

export const roomRouter = Router()
    .get('/', (req, res) => {
        res.send(roomService.findAll());
    })
    .get('/:id', (req, res) => {
        res.send(roomService.findById(req.params.id));
    });
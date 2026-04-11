import {Router} from 'express';
import * as roomService from '../service/room.service.ts';

export const httpRoomRouter = Router()
    .get('/', (_req, res) => {
        console.debug('[Room Route] Get rooms');
        res.json(roomService.getAllRooms());
    })
    .get('/:id', (req, res) => {
        console.debug(`[Room Route] Get room ${req.params.id}`);
        const room = roomService.getRoomById(req.params.id);
        res.json(room);
    });
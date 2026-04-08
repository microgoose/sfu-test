import {Router} from 'express';
import * as roomService from '../service/room.service.ts';

export const roomRouter = Router()
    .get('/', (_req, res) => {
        console.debug('[Room Route] Get rooms');
        res.json(roomService.findAllRooms());
    })
    .get('/:id', (req, res) => {
        console.debug(`[Room Route] Get room ${req.params.id}`);
        const room = roomService.findRoomById(req.params.id);
        res.json(room);
    });
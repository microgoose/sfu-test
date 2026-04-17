import {Router} from 'express';
import * as roomService from '@/service/room.service.js';

export const httpRoomRouter = Router()
    .post('/create', (req, res) => {
        console.debug(`[Room Route] Create room`);
        // TODO
        roomService
            .createRoom(crypto.randomUUID(), 'anonymous.user')
            .then((room) => res.json(room));
    })
    .get('/:id', (req, res) => {
        console.debug(`[Room Route] Get room ${req.params.id}`);
        const room = roomService.getRoomById(req.params.id);
        res.json(room);
    });
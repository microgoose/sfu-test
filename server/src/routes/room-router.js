import {Router} from "express";
import * as roomService from "../services/rooms-service.js";
import {addParticipantToRoom, removeParticipantFromRoom} from "../services/rooms-service.js";
import {MESSAGE_TYPES} from "../config/ws-routes.js";

export const roomRouter = Router()
    .get('/', (req, res) => {
        res.send(roomService.findAll());
    })
    .get('/:id', (req, res) => {
        if (!req.params.id)
            throw new Error('Missing room.tsx');

        res.send(roomService.findById(req.params.id));
    });

export const wsRoomRoutes = {
    [MESSAGE_TYPES.JOIN_ROOM]: (socket, payload) => {
        if (!socket.id)
            throw new Error('Missing socket id');
        if (!payload.roomId)
            throw new Error('Missing room.tsx');

        addParticipantToRoom(socket, payload.roomId);
    },

    [MESSAGE_TYPES.LEAVE_ROOM]: (socket) => {
        if (!socket.id)
            throw new Error('Missing socket id');

        removeParticipantFromRoom(socket);
    }
};
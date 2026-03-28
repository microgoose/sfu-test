import {connectParticipant, disconnectParticipant, setupTransport} from "../services/participant-service.js";
import {MESSAGE_TYPES} from "../config/ws-routes.js";

export const wsParticipantRoutes = {
    [MESSAGE_TYPES.CONNECT]: (socket) => {
        if (!socket)
            throw new Error('Missing socket');
        if (!socket.id)
            throw new Error('Missing socket id');

        connectParticipant(socket);
    },

    [MESSAGE_TYPES.DISCONNECT]: (socket) => {
        if (!socket)
            throw new Error('Missing socket');
        if (!socket.id)
            throw new Error('Missing socket id');

        disconnectParticipant(socket.id);
    },

    [MESSAGE_TYPES.CREATE_TRANSPORT]: (socket) => {
        if (!socket)
            throw new Error('Missing socket');
        if (!socket.id)
            throw new Error('Missing socket id');

        setupTransport(socket.id);
    }
};
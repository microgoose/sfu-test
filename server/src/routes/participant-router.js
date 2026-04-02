import {
    connectParticipant,
    disconnectParticipant, setupConnectTransport, setupConsume,
    setupProduce,
    setupTransport
} from "../services/participant-service.js";
import {MESSAGE_TYPES} from "../config/ws-routes.js";
import {resumeConsume} from "../infra/mediasoup/ms-transport-service.js";

export const wsParticipantRoutes = {
    [MESSAGE_TYPES.CONNECT]: (socket) => {
        if (!socket) throw new Error('Missing socket');
        if (!socket.id) throw new Error('Missing socket id');
        connectParticipant(socket);
    },

    [MESSAGE_TYPES.DISCONNECT]: (socket) => {
        if (!socket) throw new Error('Missing socket');
        if (!socket.id) throw new Error('Missing socket id');
        disconnectParticipant(socket.id);
    },

    [MESSAGE_TYPES.CREATE_TRANSPORT]: (socket) => {
        if (!socket) throw new Error('Missing socket');
        if (!socket.id) throw new Error('Missing socket id');
        setupTransport(socket.id);
    },

    [MESSAGE_TYPES.CONNECT_TRANSPORT]: (socket, payload) => {
        if (!payload.transportId) throw new Error('Missing transportId');
        if (!payload.dtlsParameters) throw new Error('Missing dtlsParameters');
        setupConnectTransport(socket.id, payload);
    },

    [MESSAGE_TYPES.PRODUCE]: async (socket, payload) => {
        if (!payload.transportId) throw new Error('Missing transportId');
        if (!payload.kind) throw new Error('Missing kind');
        if (!payload.rtpParameters) throw new Error('Missing rtpParameters');
        setupProduce(socket.id, payload);
    },

    [MESSAGE_TYPES.CONSUME]: async (socket, payload) => {
        if (!payload.transportId) throw new Error('Missing transportId');
        if (!payload.producerId) throw new Error('Missing producer');
        if (!payload.rtpCapabilities) throw new Error('Missing rtp capabilities');
        setupConsume(socket.id, payload);
    },

    [MESSAGE_TYPES.RESUME_CONSUMER]: async (socket, payload) => {
        if (!payload.consumerId) throw new Error('Missing consumerId');
        resumeConsume(payload.consumerId);
    },
};
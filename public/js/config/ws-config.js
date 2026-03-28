export const MESSAGE_TYPES = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',

    JOIN_ROOM: 'join-room',
    LEAVE_ROOM: 'leave-room',
    PARTICIPANT_JOINED: 'participant-joined',
    PARTICIPANT_LEFT: 'participant-left',

    RTP_CAPABILITIES_EVENT: 'rtp-capabilities-event',
    CREATE_TRANSPORT: 'create-transport',
    TRANSPORT_CREATED: 'transport-created',

    ERROR: 'error',
};

export function createWsClient(url) {
    const ws = new WebSocket(url);
    const routes = new Map();

    ws.onopen = (event) => {
        console.log('WebSocket connected');
        routes.get(MESSAGE_TYPES.CONNECT)(event);
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (!message.type)
            throw new Error(`Incorrect message ${message}`);

        for (let path of routes.keys()) {
            if (message.type === path) {
                routes.get(path)(message);
                return;
            }
        }

        console.error("Not found route for:", message);
    };

    ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        routes.get(MESSAGE_TYPES.DISCONNECT)(event);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        routes.get(MESSAGE_TYPES.ERROR)(error);
    };

    function send(path, payload) {
        ws.send(JSON.stringify({
            type: path,
            ...payload,
        }));
    }

    function setRoute(path, callback) {
        routes.set(path, callback);
    }

    function joinRoom(roomId) {
        send(MESSAGE_TYPES.JOIN_ROOM, {
            roomId,
        });
    }

    function leaveRoom(roomId) {
        send(MESSAGE_TYPES.LEAVE_ROOM, {
            roomId,
        });
    }

    function createTransport(sctpCapabilities) {
        send(MESSAGE_TYPES.CREATE_TRANSPORT, {
            sctpCapabilities
        });
    }

    return {
        setRoute,
        joinRoom,
        leaveRoom,
        createTransport
    };
}
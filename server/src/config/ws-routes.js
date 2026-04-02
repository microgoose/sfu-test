export const MESSAGE_TYPES = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',

    JOIN_ROOM: 'join-room',
    LEAVE_ROOM: 'leave-room',
    PARTICIPANT_JOINED: 'participant-joined',
    PARTICIPANT_LEFT: 'participant-left',

    RTP_CAPABILITIES_EVENT: 'rtp-capabilities-event',
    CREATE_TRANSPORT: 'create-transport',
    SEND_TRANSPORT_CREATED: 'send-transport-created',
    RECV_TRANSPORT_CREATED: 'rect-transport-created',
    CONNECT_TRANSPORT: 'connect-transport',
    TRANSPORT_CONNECTED: 'transport-connected',
    PRODUCE: 'produce',
    PRODUCED: 'produced',
    NEW_PRODUCER: 'new-producer',
    CONSUME: 'consume',
    CONSUMED: 'consumed',
    RESUME_CONSUMER: 'resume-consumer',

    ERROR: 'error',
};
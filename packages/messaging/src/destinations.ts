export const destinations = {
    room: {
        join: '/room/join',
        leave: '/room/leave',
        participantJoined: '/room/participant/joined',
        participantLeft: '/room/participant/left',
    },
    router: {
        rtpCapabilities: '/room/router/rtp-capabilities',
    },
    transport: {
        create: '/room/transport/create',
        connect: '/room/transport/connect',
    },
    producer: {
        list: '/room/producer/list',
        new: '/room/producer/new',
        create: '/room/producer/create',
        close: '/room/producer/close',
    },
    consumer: {
        create: '/room/consumer/create',
        resume: '/room/consumer/resume',
    },
} as const;
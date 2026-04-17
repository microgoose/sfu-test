export const toTopic = (key: string) => `/topic/${key}`;
export const toExchange = (key: string) => `/exchange/amq.topic/${key}`;

export const destinations = {
    room: {
        join: (roomId: string) => `room.${roomId}.join`,
        leave: (roomId: string) => `room.${roomId}.leave`,
        participantJoined: (roomId: string) => `room.${roomId}.participant.joined`,
        participantLeft: (roomId: string) => `room.${roomId}.participant.left`,
    },
    router: {
        getRtpCapabilities: (roomId: string) => `room.${roomId}.router.get-rtp-capabilities`,
    },
    transport: {
        create: (roomId: string) => `room.${roomId}.transport.create`,
        connect: (roomId: string) => `room.${roomId}.transport.connect`,
    },
    producer: {
        getList: (roomId: string) => `room.${roomId}.producer.get-list`,
        new: (roomId: string) => `room.${roomId}.producer.new`,
        create: (roomId: string) => `room.${roomId}.producer.create`,
        close: (roomId: string) => `room.${roomId}.producer.close`,
    },
    consumer: {
        create: (roomId: string) => `room.${roomId}.consumer.create`,
        resume: (roomId: string) => `room.${roomId}.consumer.resume`,
    },
} as const;
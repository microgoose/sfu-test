export const COMMANDS = {
    room: {
        join: '/app/room.join',
        leave: '/app/room.leave',
    },
    transport: {
        create: '/app/transport.create',
        connect: '/app/transport.connect',
    },
    producer: {
        create: '/app/producer.produce',
    },
    consumer: {
        create: '/app/consumer.consume',
        resume: '/app/consumer.resume',
    },
} as const;
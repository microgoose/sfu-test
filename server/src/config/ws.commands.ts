export const COMMANDS = {
    room: {
        join:  '/app/room.join',
        leave: '/app/room.leave',
    },
    transport: {
        create:  '/app/transport.create',
        connect: '/app/transport.connect',
    },
    producer: {
        produce: '/app/producer.produce',
    },
    consumer: {
        consume: '/app/consumer.consume',
        resume:  '/app/consumer.resume',
    },
} as const;
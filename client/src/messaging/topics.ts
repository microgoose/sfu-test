export const TOPICS = {
    room: {
        participantJoined: '/topic/room.participant.joined',
        participantLeft: '/topic/room.participant.left',
        rtpCapabilities: '/topic/room.rtp-capabilities',
    },
    transport: {
        connected: '/topic/transport.connected',
        sendCreated: '/topic/transport.send.created',
        recvCreated: '/topic/transport.recv.created',
    },
    producer: {
        produced: '/topic/producer.produced',
        newProducer: '/topic/producer.new',
    },
    consumer: {
        consumed: '/topic/consumer.consumed',
    },
} as const;
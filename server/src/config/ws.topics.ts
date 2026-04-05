export const TOPICS = {
    room: {
        participantJoined: '/topic/room.participant.joined',
        participantLeft:   '/topic/room.participant.left',
        rtpCapabilities:   '/topic/room.rtp-capabilities',
    },
    transport: {
        sendCreated: '/topic/transport.send.created',
        recvCreated: '/topic/transport.recv.created',
        connected:   '/topic/transport.connected',
    },
    producer: {
        produced:    '/topic/producer.produced',
        newProducer: '/topic/producer.new',
    },
    consumer: {
        consumed: '/topic/consumer.consumed',
    },
} as const;
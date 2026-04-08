export const TOPICS = {
    room: {
        participantJoined: '/topic/room.participant.joined',
        participantLeft: '/topic/room.participant.left',
        rtpCapabilities: '/topic/room.rtp-capabilities',
    },
    transport: {
        connected: '/topic/transport.connected',
        created: '/topic/transport.send.created',
    },
    producer: {
        created: '/topic/producer.created',
        new: '/topic/producer.new',
        roomList: '/topic/producer.room-list',
    },
    consumer: {
        created: '/topic/consumer.created',
    },
} as const;
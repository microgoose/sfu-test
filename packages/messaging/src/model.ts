export enum MessageType { REQUEST, RESPONSE, ERROR }
export type MessageBody = any;

export class Message {
    public type;

    constructor(type: MessageType) {    
        this.type = type;
    }
}

export class RequestMessage extends Message {
    public id;
    public destination;
    public body;

    constructor(destination: string, id: string, body?: MessageBody) {
        super(MessageType.REQUEST);
        this.id = id;
        this.destination = destination;
        this.body = body;
    }

    static convert(data: any): RequestMessage {
        if (typeof data !== 'object' || data === null || Array.isArray(data))
            throw new Error('Expected json object');
        if (typeof (data as any).type !== 'number' || (data as any).type !== MessageType.REQUEST)
            throw new Error('Missing or invalid type');
        if (typeof (data as any).destination !== 'string' || (data as any).destination.trim() === '')
            throw new Error('Missing or invalid destination');
        if (typeof (data as any).id !== 'string' || (data as any).id.trim() === '')
            throw new Error('Missing or invalid id');

        return new RequestMessage(data.destination, data.id, data.body);
    }
}

export class ResponseMessage extends Message {
    public id;
    public body;

    constructor(id: string, body?: MessageBody) {
        super(MessageType.RESPONSE);
        this.id = id;
        this.body = body;
    }

    static convert(data: any): ResponseMessage {
        if (typeof data !== 'object' || data === null || Array.isArray(data))
            throw new Error('Expected json object');
        if (typeof (data as any).type !== 'number' || (data as any).type !== MessageType.RESPONSE)
            throw new Error('Missing or invalid type');
        if (typeof (data as any).id !== 'string' || (data as any).id.trim() === '')
            throw new Error('Missing or invalid id');

        return new ResponseMessage(data.id, data.body);
    }
}

export class ErrorMessage extends Message {
    public message;

    constructor(message: string) {
        super(MessageType.ERROR);
        this.message = message;
    }

    static convert(data: any): ErrorMessage {
        if (typeof data !== 'object' || data === null || Array.isArray(data))
            throw new Error('Expected json object');
        if (typeof (data as any).type !== 'number' || (data as any).type !== MessageType.ERROR)
            throw new Error('Missing or invalid type');
        if (typeof (data as any).message !== 'string' || (data as any).message.trim() === '')
            throw new Error('Missing or invalid error message');

        return new ErrorMessage(data.message);
    }
}

export class ErrorBody {
    public message;

    constructor(message: string) {
        this.message = message;
    }
}
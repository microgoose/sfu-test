import {ErrorBody, ErrorMessage, MessageBody, MessageType, RequestMessage, ResponseMessage} from "./model.js";
import {MessagingRouter, RouteHandler} from "./messaging-router.js";

const MAX_PAYLOAD_SIZE = 10 * 1024; // 10 KB

export interface MessagingExchangerConstructor {
    router: MessagingRouter,
    timeout?: number,
    onSend: (payload: string) => void,
    onErrorMessage: (error: ErrorMessage) => void;
}

export interface PendingResponse {
    closeTimer: () => void;
    resolve: (response: ResponseMessage) => void;
    reject: (error: Error) => void;
}

export class MessagingExchanger {
    private pendingResponses = new Map<string, PendingResponse>();
    private router;
    private timeout;
    private onSend;
    private onErrorMessage;

    constructor(props: MessagingExchangerConstructor) {
        this.router = props.router;
        this.onSend = props.onSend;
        this.timeout = props.timeout ?? 30_000;
        this.onErrorMessage = props.onErrorMessage;
    }

    send(destination: string, body?: MessageBody): Promise<ResponseMessage> {
        const id = crypto.randomUUID();
        const request = new RequestMessage(destination, id, body);
        return new Promise((resolve, reject) => {
            this.onSend(JSON.stringify(request));

            const timer = setTimeout(() => {
                this.pendingResponses.delete(id);
                reject(new Error('Request timed out'))
            }, this.timeout);

            this.pendingResponses.set(id, {
                closeTimer: () => clearTimeout(timer),
                resolve,
                reject
            });
        });
    }

    on(destination: string, handler: RouteHandler) {
        this.router.on(destination, handler);
    }

    async handleIncomingMessage(data: string) {
        try {
            const parsed = parseMessage(data);
            const messageType = (parsed as any).type;

            if (messageType === MessageType.REQUEST)
                await this.handleIncomingRequest(parsed);
            else if (messageType === MessageType.RESPONSE)
                await this.handleIncomingResponse(parsed);
            else if (messageType === MessageType.ERROR)
                this.handleIncomingError(parsed);
            else
                console.error(`Unhandled message type: ${messageType}`);
        } catch (ex) {
            console.error(ex);
        }
    }

    private async handleIncomingRequest(data: any) {
        const request = RequestMessage.convert(data);

        try {
            try {
                const response = await this.router.dispatch(request);
                this.onSend(JSON.stringify(new ResponseMessage(
                    request.id,
                    response,
                )));
            } catch (ex) {
                console.error(ex);
                this.onSend(JSON.stringify(new ResponseMessage(
                    request.id,
                    new ErrorBody(getErrorMessage(ex)),
                )));
            }
        } catch (ex) {
            try {
                this.onSend(JSON.stringify(new ErrorMessage(getErrorMessage(ex))));
            } catch (ex) {
                console.error(ex);
            }
        }
    }

    private async handleIncomingResponse(data: any) {
        const response = ResponseMessage.convert(data);
        const callbacks = this.pendingResponses.get(response.id);
        this.pendingResponses.delete(response.id);

        if (callbacks === undefined)
            return console.error(`Unknown response: ${response}`);

        callbacks.closeTimer();
        callbacks.resolve(response);
    }

    private handleIncomingError(data: any) {
        this.onErrorMessage(ErrorMessage.convert(data));
    }
}

function parseMessage(raw: any) {
    if (typeof raw !== 'string')
        throw new Error('Expected string');
    if (new TextEncoder().encode(raw).length > MAX_PAYLOAD_SIZE)
        throw new Error('Payload too large');

    try {
        return JSON.parse(raw);
    } catch (ex) {
        throw new Error('Invalid json');
    }
}

function getErrorMessage(ex: Error | unknown) {
    if (ex instanceof Error) {
        return ex.message;
    } else {
        return 'Internal error';
    }
}
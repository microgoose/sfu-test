import {MessageBody, RequestMessage} from "./model.js";

export type RouteHandlerPayload<T> = { body: T };
export type RouteHandlerResponse<T> = Promise<T>;
export type RouteHandler<Req = MessageBody, Res = MessageBody> = (payload: RouteHandlerPayload<Req>) => RouteHandlerResponse<Res>;

export class MessagingRouter {
    private routes = new Map<string, RouteHandler>();

    on(destination: string, handler: RouteHandler) {
        if (this.routes.has(destination))
            throw new Error("Messaging route '" + destination + "' already exists");

        this.routes.set(destination, handler);
    }

    async dispatch(request: RequestMessage): RouteHandlerResponse<MessageBody> {
        const handler = this.routes.get(request.destination);
        if (!handler)
            throw new Error(`Destination not found: ${request.destination}`);

        return handler({
            body: request.body,
        });
    }
}
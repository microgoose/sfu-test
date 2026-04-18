import {connectMessagingClient, createClient, createMessaging, createStompAdapter} from '@sfu-test/messaging';

const url = 'ws://localhost:15674/ws';
const client = createClient(url, 'guest', 'guest');
const adapter = createStompAdapter(client);
const messaging = createMessaging(adapter);

export async function setupMessagingClient() {
    await connectMessagingClient(client);
    return messaging;
}
import {connectMessagingClient, createClient, createMessaging, createStompAdapter} from '@sfu-test/messaging';

export async function setupMessagingClient(url: string) {
    const client = createClient(url);
    const adapter = createStompAdapter(client);
    const messaging = createMessaging(adapter);
    await connectMessagingClient(client);
    return messaging;
}
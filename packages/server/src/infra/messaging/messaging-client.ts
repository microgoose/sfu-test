import WebSocket from 'ws';
import {createClient, createMessaging, createStompAdapter} from '@sfu-test/messaging';

(global as any).WebSocket = WebSocket;

// TODO
export const client = createClient('ws://localhost:15674/ws', 'guest', 'guest');
const adapter = createStompAdapter(client);
export const messaging = createMessaging(adapter);
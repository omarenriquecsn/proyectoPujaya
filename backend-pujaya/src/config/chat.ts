import { GatewayMetadata } from '@nestjs/websockets';

export const chatGatewayConfig: GatewayMetadata = {
path: process.env.WEBSOCKET_PATH || '/chat',
cors: {
    origin: process.env.WEBSOCKET_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true,
},
};
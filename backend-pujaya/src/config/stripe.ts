import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
    secretKey: process.env.STRIPE_SECRET_KEY,
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    apiVersion: '2025-05-28.basil',
}));
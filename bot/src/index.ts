import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import { Client, GatewayIntentBits } from 'discord.js';
import { createClient } from 'redis';

import { logger } from './logger';

export const GLOBALS = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN!,
    REDIS_URL: process.env.REDIS_URL!,
    TAG_TTL: process.env.TAG_TTL
        ? Number.parseInt(process.env.TAG_TTL)
        : 3 * 24 * 60 * 60, // 3 days
};
const requiredGlobals: (keyof typeof GLOBALS)[] = [
    'DISCORD_TOKEN',
    'REDIS_URL',
];

for (const value of requiredGlobals) {
    if (!GLOBALS[value]) {
        throw new Error(`Missing ENV value: ${value}`);
    }
}

export const redisClient = createClient({
    url: GLOBALS.REDIS_URL,
});

export const botClient = new Client({
    intents: [GatewayIntentBits.GuildPresences, GatewayIntentBits.Guilds],
});

botClient.on('ready', (client) => {
    logger.info(`Logged in as ${botClient.user?.tag}`);
});

botClient.on('presenceUpdate', async (oldPresence, newPresence) => {
    logger.debug(
        `Presence update: ${oldPresence?.user?.tag} -> ${newPresence?.user?.tag}`
    );
    const { user, clientStatus, status, activities } = newPresence;

    if (!user) {
        return;
    }

    const { id: userId, username, discriminator } = user;

    const formattedActivities = activities.map((activity) => {
        const { type, name, details, state } = activity;

        return { type, name, details, state };
    });

    const data = {
        username,
        discriminator,
        status,
        clientStatus,
        formattedActivities,
    };

    await redisClient.set('presence:' + userId, JSON.stringify(data));
    await redisClient.expire('presence:' + userId, GLOBALS.TAG_TTL);
});

(async () => {
    logger.info('Connecting to redis');
    await redisClient.connect();

    logger.info('Connecting to discord');
    await botClient.login(GLOBALS.DISCORD_TOKEN);
})();

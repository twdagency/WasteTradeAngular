import Redis from 'ioredis';
import { REDIS_DB, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '../config';

export class RedisService {
    public redisClient: Redis;

    constructor() {
        this.redisClient = new Redis({
            host: REDIS_HOST,
            port: REDIS_PORT,
            password: REDIS_PASSWORD,
            db: REDIS_DB,
        });
    }
}

export const redisService = new RedisService();

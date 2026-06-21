import { randomUUID } from "crypto";
import { redis } from "../config/redis";

export class RedisLockService {
  async acquire(key: string, ttlSeconds: number) {
    const token = randomUUID();
    const result = await redis.set(key, token, "EX", ttlSeconds, "NX");
    return result === "OK" ? token : null;
  }

  async release(key: string, token: string) {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      end
      return 0
    `;
    await redis.eval(script, 1, key, token);
  }
}

export const redisLockService = new RedisLockService();

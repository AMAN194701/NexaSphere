import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient = null;

export const initRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = createClient({
      url: redisUrl
    });

    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    redisClient.on('connect', () => logger.info('Redis Client Connected'));

    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to initialize Redis', error);
  }
};

export const getCache = async (key) => {
  if (!redisClient?.isReady) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Redis Get Error for key ${key}:`, error);
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds = 3600) => {
  if (!redisClient?.isReady) return;
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logger.error(`Redis Set Error for key ${key}:`, error);
  }
};

export const invalidateCache = async (keyPattern) => {
  if (!redisClient?.isReady) return;
  try {
    // If exact key
    if (!keyPattern.includes('*')) {
      await redisClient.del(keyPattern);
      return;
    }
    
    // If pattern matching (e.g. for clearing all portfolio caches)
    const keys = await redisClient.keys(keyPattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.error(`Redis Invalidate Error for pattern ${keyPattern}:`, error);
  }
};

export default redisClient;

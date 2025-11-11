const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Get value from Redis by key
 * @param {string} key
 */
async function getCache(key) {
  try {
    return await redis.get(key);
  } catch (err) {
    console.error('Redis GET error:', err);
    return null;
  }
}

/**
 * Set value in Redis by key
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 */
async function setCache(key, value, ttlSeconds = 3600) {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.error('Redis SET error:', err);
  }
}

module.exports = { redis, getCache, setCache };
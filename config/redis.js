const redis = require('redis');
require('dotenv').config();

let redisClient = null;
let redisAvailable = false;

// Only create Redis client if explicitly enabled
if (process.env.REDIS_ENABLED === 'true') {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log('Redis: Giving up reconnection after 3 attempts');
            return false; // Stop reconnecting
          }
          return Math.min(retries * 100, 3000);
        },
        connectTimeout: 5000
      }
    });

    redisClient.on('error', (err) => {
      // Only log once, don't spam
      if (!redisAvailable) {
        console.log('Redis: Not available (optional - using memory store)');
        redisAvailable = false;
      }
    });

    redisClient.on('connect', () => {
      console.log('Redis: Connected successfully');
      redisAvailable = true;
    });

    redisClient.on('ready', () => {
      redisAvailable = true;
    });

    redisClient.on('end', () => {
      redisAvailable = false;
    });

    // Try to connect, but don't fail if it doesn't work
    redisClient.connect().catch(() => {
      // Silently fail - Redis is optional
      redisAvailable = false;
    });
  } catch (error) {
    // Redis is optional, continue without it
    redisAvailable = false;
  }
} else {
  console.log('Redis: Disabled (set REDIS_ENABLED=true in .env to enable)');
}

// Create a wrapper that checks if Redis is available
const getRedisClient = () => {
  if (redisClient && redisAvailable && redisClient.isOpen) {
    return redisClient;
  }
  return null;
};

module.exports = {
  getRedisClient,
  isAvailable: () => redisAvailable && redisClient && redisClient.isOpen
};

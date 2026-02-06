const { getRedisClient, isAvailable } = require('../config/redis');

const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const redisClient = getRedisClient();
    const key = `cache:${req.originalUrl}`;
    
    try {
      if (redisClient && isAvailable()) {
        const cached = await redisClient.get(key);
        if (cached) {
          return res.send(cached);
        }
      }
      
      // Store original send function
      const originalSend = res.send;
      res.send = function (data) {
        if (redisClient && isAvailable() && res.statusCode === 200) {
          redisClient.setEx(key, duration, data).catch(() => {
            // Silently fail - caching is optional
          });
        }
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      // Silently continue without caching
      next();
    }
  };
};

const clearCache = async (pattern) => {
  try {
    const redisClient = getRedisClient();
    if (redisClient && isAvailable()) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (error) {
    // Silently fail - cache clearing is optional
  }
};

module.exports = {
  cacheMiddleware,
  clearCache
};

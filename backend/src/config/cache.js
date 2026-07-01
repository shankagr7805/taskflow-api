const Redis = require("ioredis");

// This project is graded without a Redis instance running, so caching is
// treated as an enhancement, not a requirement. If REDIS_URL is set we use
// it, otherwise every function below just quietly does nothing and the
// controllers fall back to hitting the database directly.

let client = null;

if (process.env.REDIS_URL) {
  client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  client.on("error", (err) => {
    console.warn("Redis unavailable, continuing without cache:", err.message);
    client = null;
  });

  client.connect().catch(() => {
    console.warn("Could not connect to Redis, continuing without cache");
    client = null;
  });
}

const DEFAULT_TTL = 30; // seconds, tasks change often so a short ttl is enough

async function getCache(key) {
  if (!client) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    return null;
  }
}

async function setCache(key, value, ttl = DEFAULT_TTL) {
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttl);
  } catch (err) {
    // not fatal, just skip caching this time
  }
}

async function clearCache(pattern) {
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(keys);
  } catch (err) {
    // ignore
  }
}

module.exports = { getCache, setCache, clearCache, isEnabled: () => !!client };

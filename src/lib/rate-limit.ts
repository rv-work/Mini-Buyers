interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean old entries
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < windowStart) {
      delete store[key];
    }
  });

  if (!store[identifier]) {
    store[identifier] = { count: 0, resetTime: now + windowMs };
  }

  const current = store[identifier];

  if (current.resetTime < now) {
    current.count = 0;
    current.resetTime = now + windowMs;
  }

  current.count++;

  return {
    success: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    resetTime: current.resetTime,
  };
}

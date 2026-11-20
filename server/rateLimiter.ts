import { Request, Response, NextFunction } from 'express';

// ============================================================================
// 1. TOKEN BUCKET ALGORITHM
// ============================================================================
interface BucketState {
  tokens: number;
  lastRefill: number; // timestamp in ms
}

export interface TokenBucketOptions {
  capacity: number;           // Max burst capacity (e.g., 20 tokens)
  refillRatePerSec: number;   // Tokens restored every second (e.g., 2/sec)
  costPerRequest?: number;    // Tokens consumed per request (default: 1)
  keyGenerator?: (req: Request) => string;
  errorMessage?: string;
}

export class TokenBucketStore {
  private buckets = new Map<string, BucketState>();
  private capacity: number;
  private refillRatePerMs: number;
  private cost: number;

  constructor(options: TokenBucketOptions) {
    this.capacity = options.capacity;
    this.refillRatePerMs = options.refillRatePerSec / 1000;
    this.cost = options.costPerRequest || 1;

    // Periodic garbage collection every 10 minutes to prevent memory leaks
    setInterval(() => this.cleanup(), 10 * 60 * 1000).unref();
  }

  public take(key: string): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(key, bucket);
    } else {
      // Calculate refill based on elapsed time
      const elapsedMs = now - bucket.lastRefill;
      const addedTokens = elapsedMs * this.refillRatePerMs;
      bucket.tokens = Math.min(this.capacity, bucket.tokens + addedTokens);
      bucket.lastRefill = now;
    }

    if (bucket.tokens >= this.cost) {
      bucket.tokens -= this.cost;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        retryAfterSeconds: 0,
      };
    }

    // Bucket empty: calculate time until next token is available
    const missingTokens = this.cost - bucket.tokens;
    const waitMs = missingTokens / this.refillRatePerMs;
    const retryAfterSeconds = Math.ceil(waitMs / 1000);

    return {
      allowed: false,
      remaining: Math.floor(bucket.tokens),
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  private cleanup() {
    const cutoff = Date.now() - 30 * 60 * 1000; // 30 min of inactivity
    for (const [key, state] of this.buckets.entries()) {
      if (state.lastRefill < cutoff) {
        this.buckets.delete(key);
      }
    }
  }
}

export function createTokenBucketLimiter(options: TokenBucketOptions) {
  const store = new TokenBucketStore(options);
  const getKey = options.keyGenerator || ((req: Request) => {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || 'anonymous';
  });

  return (req: Request, res: Response, next: NextFunction) => {
    const key = getKey(req);
    const result = store.take(key);

    // Standard RFC Rate Limit Headers
    res.setHeader('X-RateLimit-Limit', options.capacity);
    res.setHeader('X-RateLimit-Remaining', result.remaining);

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfterSeconds);
      return res.status(429).json({
        error: options.errorMessage || 'Too many requests. Please slow down and try again later.',
        retryAfterSeconds: result.retryAfterSeconds,
      });
    }

    next();
  };
}

// ============================================================================
// 2. SLIDING WINDOW LOG ALGORITHM
// ============================================================================
export interface SlidingWindowOptions {
  windowMs: number;          // Window size in ms (e.g. 60000 for 1 minute)
  maxRequests: number;       // Max requests in this sliding window
  keyGenerator?: (req: Request) => string;
  errorMessage?: string;
}

export class SlidingWindowStore {
  private logs = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;

  constructor(options: SlidingWindowOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;

    // Periodic GC every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  public hit(key: string): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const threshold = now - this.windowMs;

    let timestamps = this.logs.get(key) || [];
    // Filter out timestamps older than current sliding window
    timestamps = timestamps.filter((t) => t > threshold);

    if (timestamps.length < this.maxRequests) {
      timestamps.push(now);
      this.logs.set(key, timestamps);
      return {
        allowed: true,
        remaining: this.maxRequests - timestamps.length,
        resetMs: Math.ceil(this.windowMs / 1000),
      };
    }

    // Oldest timestamp in current window defines reset time
    const oldest = timestamps[0];
    const resetMs = Math.max(0, oldest + this.windowMs - now);

    this.logs.set(key, timestamps);
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    };
  }

  private cleanup() {
    const now = Date.now();
    const threshold = now - this.windowMs;
    for (const [key, list] of this.logs.entries()) {
      const active = list.filter((t) => t > threshold);
      if (active.length === 0) {
        this.logs.delete(key);
      } else {
        this.logs.set(key, active);
      }
    }
  }
}

export function createSlidingWindowLimiter(options: SlidingWindowOptions) {
  const store = new SlidingWindowStore(options);
  const getKey = options.keyGenerator || ((req: Request) => {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || 'anonymous';
  });

  return (req: Request, res: Response, next: NextFunction) => {
    const key = getKey(req);
    const result = store.hit(key);

    const resetSeconds = Math.ceil(result.resetMs / 1000);
    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (!result.allowed) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: options.errorMessage || 'Rate limit exceeded. Please try again shortly.',
        retryAfterSeconds: resetSeconds,
      });
    }

    next();
  };
}

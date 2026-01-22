/**
 * Rate Limiter Service
 *
 * Tracks API calls to respect rate limits across different services.
 * Uses a sliding window approach to track calls within a time window.
 */

export interface RateLimiterConfig {
	name: string;
	maxCalls: number;
	windowMs: number;
}

export class RateLimiter {
	private name: string;
	private maxCalls: number;
	private windowMs: number;
	private calls: number[] = [];

	constructor(config: RateLimiterConfig) {
		this.name = config.name;
		this.maxCalls = config.maxCalls;
		this.windowMs = config.windowMs;
	}

	/**
	 * Check if we can make a call without exceeding the rate limit
	 */
	canMakeCall(): boolean {
		this.pruneOldCalls();
		return this.calls.length < this.maxCalls;
	}

	/**
	 * Record a call being made
	 */
	recordCall(): void {
		this.calls.push(Date.now());
	}

	/**
	 * Get the time to wait before we can make another call (in ms)
	 * Returns 0 if we can make a call immediately
	 */
	getWaitTime(): number {
		this.pruneOldCalls();

		if (this.calls.length < this.maxCalls) {
			return 0;
		}

		// Find the oldest call in the current window
		const oldestCall = Math.min(...this.calls);
		const waitTime = oldestCall + this.windowMs - Date.now();

		return Math.max(0, waitTime);
	}

	/**
	 * Wait until we can make a call (respecting rate limits)
	 */
	async throttle(): Promise<void> {
		const waitTime = this.getWaitTime();

		if (waitTime > 0) {
			console.debug(`[RateLimiter:${this.name}] Waiting ${waitTime}ms to respect rate limit`);
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}

		this.recordCall();
	}

	/**
	 * Get current usage stats
	 */
	getStats(): { name: string; used: number; max: number; windowMs: number; available: number } {
		this.pruneOldCalls();
		return {
			name: this.name,
			used: this.calls.length,
			max: this.maxCalls,
			windowMs: this.windowMs,
			available: Math.max(0, this.maxCalls - this.calls.length)
		};
	}

	/**
	 * Remove calls that are outside the current window
	 */
	private pruneOldCalls(): void {
		const cutoff = Date.now() - this.windowMs;
		this.calls = this.calls.filter((t) => t > cutoff);
	}

	/**
	 * Reset the rate limiter (useful for testing)
	 */
	reset(): void {
		this.calls = [];
	}
}

/**
 * Pre-configured rate limiters for each API service
 */
export const rateLimiters = {
	finnhub: new RateLimiter({
		name: 'finnhub',
		maxCalls: 55, // Leave some buffer below the 60/min limit
		windowMs: 60 * 1000
	}),

	coingecko: new RateLimiter({
		name: 'coingecko',
		maxCalls: 25, // Leave buffer below 30/min limit
		windowMs: 60 * 1000
	}),

	polymarket: new RateLimiter({
		name: 'polymarket',
		maxCalls: 90, // Leave buffer below 100/min limit
		windowMs: 60 * 1000
	}),

	congress: new RateLimiter({
		name: 'congress',
		maxCalls: 4500, // Leave buffer below 5000/hour limit
		windowMs: 60 * 60 * 1000
	}),

	usaspending: new RateLimiter({
		name: 'usaspending',
		maxCalls: 100, // Conservative limit (API docs don't specify)
		windowMs: 60 * 1000
	}),

	fred: new RateLimiter({
		name: 'fred',
		maxCalls: 100, // FRED is unlimited but let's be polite
		windowMs: 60 * 1000
	}),

	feargreed: new RateLimiter({
		name: 'feargreed',
		maxCalls: 30, // Conservative limit
		windowMs: 60 * 1000
	})
};

/**
 * Helper to get all rate limiter stats
 */
export function getAllRateLimiterStats() {
	return Object.values(rateLimiters).map((limiter) => limiter.getStats());
}

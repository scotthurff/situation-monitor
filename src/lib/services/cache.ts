/**
 * Cache Manager - In-memory caching with TTL support
 * Improves reliability by reducing API calls and providing stale data fallback
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

export class CacheManager {
	private cache = new Map<string, CacheEntry<unknown>>();
	private defaultTTL: number;

	constructor(defaultTTL = 5 * 60 * 1000) {
		// Default 5 minutes
		this.defaultTTL = defaultTTL;
	}

	/**
	 * Get cached data if valid, or undefined if expired/missing
	 */
	get<T>(key: string): T | undefined {
		const entry = this.cache.get(key) as CacheEntry<T> | undefined;
		if (!entry) return undefined;

		const now = Date.now();
		if (now - entry.timestamp > entry.ttl) {
			// Entry expired, but keep it for stale fallback
			return undefined;
		}

		return entry.data;
	}

	/**
	 * Get stale data even if expired (for fallback scenarios)
	 */
	getStale<T>(key: string): T | undefined {
		const entry = this.cache.get(key) as CacheEntry<T> | undefined;
		return entry?.data;
	}

	/**
	 * Check if data is fresh (not expired)
	 */
	isFresh(key: string): boolean {
		const entry = this.cache.get(key);
		if (!entry) return false;
		return Date.now() - entry.timestamp <= entry.ttl;
	}

	/**
	 * Get age of cached data in milliseconds
	 */
	getAge(key: string): number | undefined {
		const entry = this.cache.get(key);
		if (!entry) return undefined;
		return Date.now() - entry.timestamp;
	}

	/**
	 * Set data in cache with optional custom TTL
	 */
	set<T>(key: string, data: T, ttl?: number): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl: ttl ?? this.defaultTTL
		});
	}

	/**
	 * Remove entry from cache
	 */
	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	/**
	 * Clear all cached entries
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Remove expired entries (garbage collection)
	 */
	prune(): number {
		const now = Date.now();
		let pruned = 0;

		for (const [key, entry] of this.cache.entries()) {
			// Remove entries older than 2x their TTL
			if (now - entry.timestamp > entry.ttl * 2) {
				this.cache.delete(key);
				pruned++;
			}
		}

		return pruned;
	}

	/**
	 * Get cache statistics
	 */
	stats(): { size: number; keys: string[] } {
		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys())
		};
	}
}

// Singleton instance for app-wide caching
export const globalCache = new CacheManager();

// Pre-configured caches for different data types
export const newsCache = new CacheManager(5 * 60 * 1000); // 5 minutes
export const marketCache = new CacheManager(60 * 1000); // 1 minute
export const cryptoCache = new CacheManager(60 * 1000); // 1 minute
export const intelCache = new CacheManager(10 * 60 * 1000); // 10 minutes

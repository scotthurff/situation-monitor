/**
 * Request Deduplicator - Prevents concurrent duplicate requests
 * If a request for the same resource is already in flight, returns the existing promise
 */

type PendingRequest<T> = {
	promise: Promise<T>;
	timestamp: number;
};

export class RequestDeduplicator {
	private pending = new Map<string, PendingRequest<unknown>>();
	private maxAge: number;

	constructor(maxAge = 5000) {
		// Max time to consider a request "in flight"
		this.maxAge = maxAge;
	}

	/**
	 * Execute a request, deduplicating if one is already in flight
	 */
	async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
		// Check for existing request
		const existing = this.pending.get(key) as PendingRequest<T> | undefined;
		if (existing) {
			// Check if it's still valid (not too old)
			if (Date.now() - existing.timestamp < this.maxAge) {
				return existing.promise;
			}
			// Remove stale entry
			this.pending.delete(key);
		}

		// Create new request
		const promise = fn().finally(() => {
			// Clean up after completion
			this.pending.delete(key);
		});

		this.pending.set(key, {
			promise,
			timestamp: Date.now()
		});

		return promise;
	}

	/**
	 * Check if a request is currently in flight
	 */
	isPending(key: string): boolean {
		const existing = this.pending.get(key);
		if (!existing) return false;
		if (Date.now() - existing.timestamp >= this.maxAge) {
			this.pending.delete(key);
			return false;
		}
		return true;
	}

	/**
	 * Cancel/clear a pending request
	 */
	cancel(key: string): boolean {
		return this.pending.delete(key);
	}

	/**
	 * Clear all pending requests
	 */
	clear(): void {
		this.pending.clear();
	}

	/**
	 * Get count of pending requests
	 */
	get size(): number {
		return this.pending.size;
	}
}

// Singleton instance
export const globalDeduplicator = new RequestDeduplicator();

/**
 * Service Client - Unified HTTP client with resilience features
 * Integrates caching, circuit breaker, and request deduplication
 */

import { CacheManager } from './cache';
import { CircuitBreaker, CircuitOpenError } from './circuit-breaker';
import { RequestDeduplicator } from './deduplicator';

export interface ServiceClientConfig {
	name: string;
	baseUrl?: string;
	cacheTTL?: number;
	circuitBreaker?: {
		failureThreshold?: number;
		resetTimeout?: number;
	};
	timeout?: number;
	retries?: number;
	retryDelay?: number;
}

export interface RequestOptions {
	cacheTTL?: number;
	skipCache?: boolean;
	skipDedup?: boolean;
	timeout?: number;
}

const DEFAULT_CONFIG: Required<Omit<ServiceClientConfig, 'name' | 'baseUrl' | 'circuitBreaker'>> & {
	circuitBreaker: { failureThreshold: number; resetTimeout: number };
} = {
	cacheTTL: 5 * 60 * 1000, // 5 minutes
	circuitBreaker: {
		failureThreshold: 3,
		resetTimeout: 30000
	},
	timeout: 10000, // 10 seconds
	retries: 2,
	retryDelay: 1000
};

export class ServiceClient {
	private cache: CacheManager;
	private circuit: CircuitBreaker;
	private deduplicator: RequestDeduplicator;
	private config: Required<Omit<ServiceClientConfig, 'baseUrl' | 'circuitBreaker'>> & {
		baseUrl?: string;
		circuitBreaker: { failureThreshold: number; resetTimeout: number };
	};

	constructor(config: ServiceClientConfig) {
		this.config = {
			...DEFAULT_CONFIG,
			...config,
			circuitBreaker: { ...DEFAULT_CONFIG.circuitBreaker, ...config.circuitBreaker }
		};

		this.cache = new CacheManager(this.config.cacheTTL);
		this.circuit = new CircuitBreaker(config.name, this.config.circuitBreaker);
		this.deduplicator = new RequestDeduplicator();
	}

	/**
	 * Make a GET request with full resilience
	 */
	async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
		const fullUrl = this.config.baseUrl ? `${this.config.baseUrl}${url}` : url;
		const cacheKey = `GET:${fullUrl}`;

		// Check cache first
		if (!options.skipCache) {
			const cached = this.cache.get<T>(cacheKey);
			if (cached !== undefined) {
				return cached;
			}
		}

		// Deduplicate concurrent requests
		const fetchFn = async (): Promise<T> => {
			return this.circuit.execute(async () => {
				return this.fetchWithRetry<T>(fullUrl, options);
			});
		};

		try {
			const result = options.skipDedup
				? await fetchFn()
				: await this.deduplicator.dedupe(cacheKey, fetchFn);

			// Cache successful result
			this.cache.set(cacheKey, result, options.cacheTTL ?? this.config.cacheTTL);

			return result;
		} catch (error) {
			// On failure, try to return stale cache data
			if (!options.skipCache) {
				const stale = this.cache.getStale<T>(cacheKey);
				if (stale !== undefined) {
					console.warn(`[${this.config.name}] Returning stale data for ${url}`);
					return stale;
				}
			}
			throw error;
		}
	}

	/**
	 * Fetch with retry logic
	 */
	private async fetchWithRetry<T>(url: string, options: RequestOptions): Promise<T> {
		const timeout = options.timeout ?? this.config.timeout;
		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= this.config.retries; attempt++) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), timeout);

				const response = await fetch(url, {
					signal: controller.signal,
					headers: {
						Accept: 'application/json'
					}
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				return (await response.json()) as T;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));

				// Don't retry on abort or circuit open
				if (lastError.name === 'AbortError' || lastError instanceof CircuitOpenError) {
					throw lastError;
				}

				// Wait before retry
				if (attempt < this.config.retries) {
					await new Promise((r) => setTimeout(r, this.config.retryDelay * (attempt + 1)));
				}
			}
		}

		throw lastError ?? new Error('Request failed');
	}

	/**
	 * Fetch text/XML content (for RSS feeds)
	 */
	async getText(url: string, options: RequestOptions = {}): Promise<string> {
		const fullUrl = this.config.baseUrl ? `${this.config.baseUrl}${url}` : url;
		const cacheKey = `TEXT:${fullUrl}`;

		if (!options.skipCache) {
			const cached = this.cache.get<string>(cacheKey);
			if (cached !== undefined) {
				return cached;
			}
		}

		const fetchFn = async (): Promise<string> => {
			return this.circuit.execute(async () => {
				const timeout = options.timeout ?? this.config.timeout;
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), timeout);

				const response = await fetch(fullUrl, { signal: controller.signal });
				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				return response.text();
			});
		};

		try {
			const result = options.skipDedup
				? await fetchFn()
				: await this.deduplicator.dedupe(cacheKey, fetchFn);

			this.cache.set(cacheKey, result, options.cacheTTL ?? this.config.cacheTTL);
			return result;
		} catch (error) {
			if (!options.skipCache) {
				const stale = this.cache.getStale<string>(cacheKey);
				if (stale !== undefined) {
					console.warn(`[${this.config.name}] Returning stale text for ${url}`);
					return stale;
				}
			}
			throw error;
		}
	}

	/**
	 * Get service status
	 */
	getStatus() {
		return {
			name: this.config.name,
			circuit: this.circuit.getStatus(),
			cache: this.cache.stats(),
			pendingRequests: this.deduplicator.size
		};
	}

	/**
	 * Clear cache
	 */
	clearCache(): void {
		this.cache.clear();
	}

	/**
	 * Reset circuit breaker
	 */
	resetCircuit(): void {
		this.circuit.reset();
	}
}

// Pre-configured service clients
export const newsClient = new ServiceClient({
	name: 'news',
	cacheTTL: 5 * 60 * 1000, // 5 minutes
	timeout: 15000
});

export const marketClient = new ServiceClient({
	name: 'markets',
	cacheTTL: 60 * 1000, // 1 minute
	timeout: 10000,
	circuitBreaker: { failureThreshold: 2 }
});

export const cryptoClient = new ServiceClient({
	name: 'crypto',
	baseUrl: 'https://api.coingecko.com/api/v3',
	cacheTTL: 60 * 1000,
	timeout: 10000
});

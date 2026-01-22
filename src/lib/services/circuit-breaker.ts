/**
 * Circuit Breaker - Prevents cascading failures by tracking service health
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests are blocked
 * - HALF_OPEN: Testing if service recovered
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
	failureThreshold: number; // Failures before opening
	resetTimeout: number; // Time before trying again (ms)
	halfOpenRequests: number; // Test requests in half-open state
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
	failureThreshold: 3,
	resetTimeout: 30000, // 30 seconds
	halfOpenRequests: 1
};

export class CircuitBreaker {
	private state: CircuitState = 'CLOSED';
	private failures = 0;
	private successes = 0;
	private lastFailure: number | null = null;
	private config: CircuitBreakerConfig;
	private name: string;

	constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
		this.name = name;
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	/**
	 * Check if request should be allowed through
	 */
	canRequest(): boolean {
		if (this.state === 'CLOSED') {
			return true;
		}

		if (this.state === 'OPEN') {
			// Check if reset timeout has passed
			if (this.lastFailure && Date.now() - this.lastFailure > this.config.resetTimeout) {
				this.state = 'HALF_OPEN';
				this.successes = 0;
				console.log(`[CircuitBreaker:${this.name}] Transitioning to HALF_OPEN`);
				return true;
			}
			return false;
		}

		// HALF_OPEN state - allow limited requests
		return true;
	}

	/**
	 * Record a successful request
	 */
	recordSuccess(): void {
		if (this.state === 'HALF_OPEN') {
			this.successes++;
			if (this.successes >= this.config.halfOpenRequests) {
				this.state = 'CLOSED';
				this.failures = 0;
				this.lastFailure = null;
				console.log(`[CircuitBreaker:${this.name}] Transitioning to CLOSED`);
			}
		} else if (this.state === 'CLOSED') {
			// Reset failure count on success
			this.failures = Math.max(0, this.failures - 1);
		}
	}

	/**
	 * Record a failed request
	 */
	recordFailure(error?: Error): void {
		this.failures++;
		this.lastFailure = Date.now();

		if (this.state === 'HALF_OPEN') {
			// Any failure in half-open returns to open
			this.state = 'OPEN';
			console.log(`[CircuitBreaker:${this.name}] HALF_OPEN -> OPEN after failure`);
		} else if (this.state === 'CLOSED' && this.failures >= this.config.failureThreshold) {
			this.state = 'OPEN';
			console.log(`[CircuitBreaker:${this.name}] CLOSED -> OPEN (${this.failures} failures)`);
		}
	}

	/**
	 * Execute a function with circuit breaker protection
	 */
	async execute<T>(fn: () => Promise<T>): Promise<T> {
		if (!this.canRequest()) {
			throw new CircuitOpenError(this.name, this.getTimeUntilRetry());
		}

		try {
			const result = await fn();
			this.recordSuccess();
			return result;
		} catch (error) {
			this.recordFailure(error instanceof Error ? error : undefined);
			throw error;
		}
	}

	/**
	 * Get current state
	 */
	getState(): CircuitState {
		return this.state;
	}

	/**
	 * Get time until retry is allowed (ms)
	 */
	getTimeUntilRetry(): number {
		if (this.state !== 'OPEN' || !this.lastFailure) {
			return 0;
		}
		const elapsed = Date.now() - this.lastFailure;
		return Math.max(0, this.config.resetTimeout - elapsed);
	}

	/**
	 * Manually reset the circuit breaker
	 */
	reset(): void {
		this.state = 'CLOSED';
		this.failures = 0;
		this.successes = 0;
		this.lastFailure = null;
	}

	/**
	 * Get circuit breaker status
	 */
	getStatus(): {
		name: string;
		state: CircuitState;
		failures: number;
		timeUntilRetry: number;
	} {
		return {
			name: this.name,
			state: this.state,
			failures: this.failures,
			timeUntilRetry: this.getTimeUntilRetry()
		};
	}
}

/**
 * Error thrown when circuit is open
 */
export class CircuitOpenError extends Error {
	constructor(
		public serviceName: string,
		public retryAfter: number
	) {
		super(`Circuit breaker open for ${serviceName}. Retry after ${Math.ceil(retryAfter / 1000)}s`);
		this.name = 'CircuitOpenError';
	}
}

// Pre-configured circuit breakers for different services
export const circuitBreakers = {
	news: new CircuitBreaker('news', { failureThreshold: 3, resetTimeout: 30000 }),
	markets: new CircuitBreaker('markets', { failureThreshold: 2, resetTimeout: 20000 }),
	crypto: new CircuitBreaker('crypto', { failureThreshold: 3, resetTimeout: 30000 }),
	intel: new CircuitBreaker('intel', { failureThreshold: 5, resetTimeout: 60000 }),
	polymarket: new CircuitBreaker('polymarket', { failureThreshold: 3, resetTimeout: 45000 })
};

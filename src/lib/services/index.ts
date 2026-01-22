/**
 * Services barrel export
 */

export { CacheManager, globalCache, newsCache, marketCache, cryptoCache, intelCache } from './cache';
export {
	CircuitBreaker,
	CircuitOpenError,
	circuitBreakers,
	type CircuitState,
	type CircuitBreakerConfig
} from './circuit-breaker';
export { RequestDeduplicator, globalDeduplicator } from './deduplicator';
export {
	ServiceClient,
	newsClient,
	marketClient,
	cryptoClient,
	type ServiceClientConfig,
	type RequestOptions
} from './client';

/**
 * Markets store - Manages market data with Svelte 5 runes
 * Implements cache-first loading for instant perceived performance
 */

import { fetchIndices, fetchStocks, fetchCommodities, fetchForex } from '$lib/api';
import { fetchCryptoPrices } from '$lib/api/crypto';
import { fetchPolymarket as fetchPolymarketApi } from '$lib/api/polymarket';
import { marketCache, cryptoCache } from '$lib/services/cache';
import type { MarketData, CryptoData, CommodityData, Prediction } from '$lib/types';

// Cache keys
const INDICES_CACHE_KEY = 'markets:indices';
const CRYPTO_CACHE_KEY = 'markets:crypto';
const COMMODITIES_CACHE_KEY = 'markets:commodities';

// Reactive state
let indices = $state<MarketData[]>([]);
let stocks = $state<MarketData[]>([]);
let commodities = $state<CommodityData[]>([]);
let forex = $state<MarketData[]>([]);
let crypto = $state<CryptoData[]>([]);
let polymarket = $state<Prediction[]>([]);
let isLoading = $state(false);
let error = $state<string | null>(null);
let lastUpdated = $state<Date | null>(null);

// Derived values
const totalMarketItems = $derived(indices.length + stocks.length + commodities.length + forex.length);
const hasData = $derived(totalMarketItems > 0 || crypto.length > 0);

/**
 * Load indices from cache (instant, non-blocking)
 */
function loadIndicesFromCache(): boolean {
	const cached = marketCache.getStale<MarketData[]>(INDICES_CACHE_KEY);
	if (cached && cached.length > 0) {
		indices = cached;
		return true;
	}
	return false;
}

/**
 * Load crypto from cache
 */
function loadCryptoFromCache(): boolean {
	const cached = cryptoCache.getStale<CryptoData[]>(CRYPTO_CACHE_KEY);
	if (cached && cached.length > 0) {
		crypto = cached;
		return true;
	}
	return false;
}

/**
 * Load commodities from cache
 */
function loadCommoditiesFromCache(): boolean {
	const cached = marketCache.getStale<CommodityData[]>(COMMODITIES_CACHE_KEY);
	if (cached && cached.length > 0) {
		commodities = cached;
		return true;
	}
	return false;
}

/**
 * Load all cached market data (for instant display)
 */
function loadFromCache(): boolean {
	const hadIndices = loadIndicesFromCache();
	const hadCrypto = loadCryptoFromCache();
	const hadCommodities = loadCommoditiesFromCache();
	return hadIndices || hadCrypto || hadCommodities;
}

/**
 * Fetch all indices
 */
async function loadIndices(): Promise<void> {
	try {
		const fresh = await fetchIndices();
		marketCache.set(INDICES_CACHE_KEY, fresh);
		indices = fresh;
	} catch (err) {
		console.error('[MarketsStore] Failed to fetch indices:', err);
	}
}

/**
 * Fetch all stocks
 */
async function loadStocks(): Promise<void> {
	try {
		stocks = await fetchStocks();
	} catch (err) {
		console.error('[MarketsStore] Failed to fetch stocks:', err);
	}
}

/**
 * Fetch commodities
 */
async function loadCommodities(): Promise<void> {
	try {
		const fresh = await fetchCommodities();
		marketCache.set(COMMODITIES_CACHE_KEY, fresh);
		commodities = fresh;
	} catch (err) {
		console.error('[MarketsStore] Failed to fetch commodities:', err);
	}
}

/**
 * Fetch forex
 */
async function loadForex(): Promise<void> {
	try {
		forex = await fetchForex();
	} catch (err) {
		console.error('[MarketsStore] Failed to fetch forex:', err);
	}
}

/**
 * Fetch crypto
 */
async function loadCrypto(): Promise<void> {
	try {
		const fresh = await fetchCryptoPrices();
		cryptoCache.set(CRYPTO_CACHE_KEY, fresh);
		crypto = fresh;
	} catch (err) {
		console.error('[MarketsStore] Failed to fetch crypto:', err);
	}
}

/**
 * Fetch polymarket predictions
 */
async function fetchPolymarket(): Promise<void> {
	try {
		polymarket = await fetchPolymarketApi();
		lastUpdated = new Date();
	} catch (err) {
		console.error('[MarketsStore] Failed to fetch polymarket:', err);
	}
}

/**
 * Fetch all market data
 */
async function fetchAllMarkets(): Promise<void> {
	isLoading = true;
	error = null;

	try {
		// Fetch in parallel
		await Promise.all([
			loadIndices(),
			loadStocks(),
			loadCommodities(),
			loadForex(),
			loadCrypto()
		]);
		lastUpdated = new Date();
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to fetch market data';
		console.error('[MarketsStore]', error);
	} finally {
		isLoading = false;
	}
}

/**
 * Fetch critical market data only (indices) - cache-first
 */
async function fetchCritical(): Promise<void> {
	// Show cached data immediately
	const hadCache = loadIndicesFromCache();

	isLoading = !hadCache;
	try {
		await loadIndices();
		lastUpdated = new Date();
	} finally {
		isLoading = false;
	}
}

/**
 * Fetch secondary market data (crypto, commodities) - cache-first
 */
async function fetchSecondary(): Promise<void> {
	// Show cached data immediately
	loadCryptoFromCache();
	loadCommoditiesFromCache();

	// Fetch fresh in parallel
	await Promise.all([loadCrypto(), loadCommodities()]);
}

/**
 * Hydrate indices with server-side data (for SSR)
 */
function hydrateIndices(items: MarketData[]): void {
	if (items.length > 0 && indices.length === 0) {
		indices = items;
		marketCache.set(INDICES_CACHE_KEY, items);
		lastUpdated = new Date();
	}
}

/**
 * Clear all data
 */
function clear(): void {
	indices = [];
	stocks = [];
	commodities = [];
	forex = [];
	crypto = [];
	polymarket = [];
	error = null;
}

// Export store interface
export const marketsStore = {
	get indices() {
		return indices;
	},
	get stocks() {
		return stocks;
	},
	get commodities() {
		return commodities;
	},
	get forex() {
		return forex;
	},
	get crypto() {
		return crypto;
	},
	get polymarket() {
		return polymarket;
	},
	get isLoading() {
		return isLoading;
	},
	get error() {
		return error;
	},
	get lastUpdated() {
		return lastUpdated;
	},
	get hasData() {
		return hasData;
	},
	fetchAllMarkets,
	fetchCritical,
	fetchSecondary,
	fetchPolymarket,
	loadIndices,
	loadStocks,
	loadCommodities,
	loadForex,
	loadCrypto,
	clear,
	loadFromCache,
	hydrateIndices
};

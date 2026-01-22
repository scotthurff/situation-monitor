/**
 * Markets store - Manages market data with Svelte 5 runes
 */

import { fetchIndices, fetchStocks, fetchCommodities, fetchForex } from '$lib/api';
import { fetchCryptoPrices } from '$lib/api/crypto';
import type { MarketData, CryptoData, CommodityData } from '$lib/types';

// Reactive state
let indices = $state<MarketData[]>([]);
let stocks = $state<MarketData[]>([]);
let commodities = $state<CommodityData[]>([]);
let forex = $state<MarketData[]>([]);
let crypto = $state<CryptoData[]>([]);
let isLoading = $state(false);
let error = $state<string | null>(null);
let lastUpdated = $state<Date | null>(null);

// Derived values
const totalMarketItems = $derived(indices.length + stocks.length + commodities.length + forex.length);
const hasData = $derived(totalMarketItems > 0 || crypto.length > 0);

/**
 * Fetch all indices
 */
async function loadIndices(): Promise<void> {
	try {
		indices = await fetchIndices();
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
		commodities = await fetchCommodities();
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
		crypto = await fetchCryptoPrices();
	} catch (err) {
		console.error('[MarketsStore] Failed to fetch crypto:', err);
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
 * Fetch critical market data only (indices)
 */
async function fetchCritical(): Promise<void> {
	isLoading = true;
	try {
		await loadIndices();
		lastUpdated = new Date();
	} finally {
		isLoading = false;
	}
}

/**
 * Fetch secondary market data (crypto, commodities)
 */
async function fetchSecondary(): Promise<void> {
	await Promise.all([loadCrypto(), loadCommodities()]);
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
	loadIndices,
	loadStocks,
	loadCommodities,
	loadForex,
	loadCrypto,
	clear
};

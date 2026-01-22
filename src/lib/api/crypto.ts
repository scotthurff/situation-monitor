/**
 * Crypto API - CoinGecko integration
 */

import { cryptoClient } from '$lib/services';
import { CRYPTO_IDS, API_URLS, logger } from '$lib/config';
import type { CryptoData } from '$lib/types';

interface CoinGeckoMarket {
	id: string;
	symbol: string;
	name: string;
	current_price: number;
	price_change_percentage_24h: number;
	market_cap: number;
	total_volume: number;
	sparkline_in_7d?: {
		price: number[];
	};
}

/**
 * Fetch crypto prices from CoinGecko
 */
export async function fetchCryptoPrices(): Promise<CryptoData[]> {
	try {
		const ids = CRYPTO_IDS.join(',');
		const url = `${API_URLS.coingecko}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data: CoinGeckoMarket[] = await response.json();

		return data.map((coin) => ({
			id: coin.id,
			symbol: coin.symbol.toUpperCase(),
			name: coin.name,
			price: coin.current_price,
			change24h: coin.price_change_percentage_24h || 0,
			marketCap: coin.market_cap,
			volume24h: coin.total_volume,
			lastUpdated: new Date(),
			sparkline: coin.sparkline_in_7d?.price
		}));
	} catch (err) {
		logger.error('Crypto', 'Failed to fetch crypto prices:', err);
		return [];
	}
}

/**
 * Fetch single coin details
 */
export async function fetchCoinDetails(id: string): Promise<CryptoData | null> {
	try {
		const url = `${API_URLS.coingecko}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();
		const market = data.market_data;

		return {
			id: data.id,
			symbol: data.symbol.toUpperCase(),
			name: data.name,
			price: market.current_price.usd,
			change24h: market.price_change_percentage_24h || 0,
			marketCap: market.market_cap.usd,
			volume24h: market.total_volume.usd,
			lastUpdated: new Date()
		};
	} catch (err) {
		logger.error('Crypto', `Failed to fetch coin ${id}:`, err);
		return null;
	}
}

/**
 * Fetch global crypto market data
 */
export async function fetchGlobalCryptoData(): Promise<{
	totalMarketCap: number;
	totalVolume: number;
	btcDominance: number;
	marketCapChange24h: number;
} | null> {
	try {
		const url = `${API_URLS.coingecko}/global`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();
		const global = data.data;

		return {
			totalMarketCap: global.total_market_cap.usd,
			totalVolume: global.total_volume.usd,
			btcDominance: global.market_cap_percentage.btc,
			marketCapChange24h: global.market_cap_change_percentage_24h_usd
		};
	} catch (err) {
		logger.error('Crypto', 'Failed to fetch global data:', err);
		return null;
	}
}

/**
 * Format large numbers (billions, trillions)
 */
export function formatCryptoMarketCap(value: number): string {
	if (value >= 1e12) {
		return `$${(value / 1e12).toFixed(2)}T`;
	}
	if (value >= 1e9) {
		return `$${(value / 1e9).toFixed(2)}B`;
	}
	if (value >= 1e6) {
		return `$${(value / 1e6).toFixed(2)}M`;
	}
	return `$${value.toLocaleString()}`;
}

/**
 * Format crypto price with appropriate decimals
 */
export function formatCryptoPrice(price: number): string {
	if (price >= 1000) {
		return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}
	if (price >= 1) {
		return `$${price.toFixed(2)}`;
	}
	if (price >= 0.01) {
		return `$${price.toFixed(4)}`;
	}
	return `$${price.toFixed(6)}`;
}

/**
 * Fear & Greed Index data
 */
export interface FearGreedIndex {
	value: number;
	classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
	timestamp: Date;
	previousValue?: number;
	previousClassification?: string;
}

/**
 * Alternative.me Fear & Greed API response
 */
interface FearGreedResponse {
	data: Array<{
		value: string;
		value_classification: string;
		timestamp: string;
	}>;
}

/**
 * Mock Fear & Greed data for fallback
 */
const MOCK_FEAR_GREED: FearGreedIndex = {
	value: 45,
	classification: 'Fear',
	timestamp: new Date(),
	previousValue: 42,
	previousClassification: 'Fear'
};

/**
 * Fetch Fear & Greed Index from Alternative.me
 */
export async function fetchFearGreedIndex(): Promise<FearGreedIndex> {
	try {
		// Fetch current and yesterday's values
		const url = `${API_URLS.feargreed}/?limit=2`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: FearGreedResponse = await response.json();

		if (!data.data || data.data.length === 0) {
			logger.warn('Crypto', 'No Fear & Greed data returned, using mock');
			return MOCK_FEAR_GREED;
		}

		const current = data.data[0];
		const previous = data.data[1];

		const result: FearGreedIndex = {
			value: parseInt(current.value, 10),
			classification: current.value_classification as FearGreedIndex['classification'],
			timestamp: new Date(parseInt(current.timestamp, 10) * 1000)
		};

		if (previous) {
			result.previousValue = parseInt(previous.value, 10);
			result.previousClassification = previous.value_classification;
		}

		logger.log('Crypto', `Fear & Greed Index: ${result.value} (${result.classification})`);
		return result;
	} catch (error) {
		logger.error('Crypto', 'Failed to fetch Fear & Greed Index:', error);
		return MOCK_FEAR_GREED;
	}
}

/**
 * Get Fear & Greed color based on value
 */
export function getFearGreedColor(value: number): string {
	if (value <= 20) return '#ff4444'; // Extreme Fear - red
	if (value <= 40) return '#ff8844'; // Fear - orange
	if (value <= 60) return '#ffcc00'; // Neutral - yellow
	if (value <= 80) return '#88cc44'; // Greed - light green
	return '#44ff44'; // Extreme Greed - green
}

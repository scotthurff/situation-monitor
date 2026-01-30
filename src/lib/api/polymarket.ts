/**
 * Polymarket API - Prediction market data
 *
 * Fetches real prediction market data from Polymarket's public API.
 * Falls back to Kalshi if Polymarket fails.
 */

import { API_URLS, logger, fetchWithProxy } from '$lib/config';
import { rateLimiters } from '$lib/services';
import type { Prediction } from '$lib/types';

/**
 * Polymarket API response types
 */
interface PolymarketMarket {
	id: string;
	question: string;
	conditionId: string;
	slug: string;
	resolutionSource: string;
	endDate: string;
	liquidity: number;
	volume: number;
	volume24hr: number;
	clobTokenIds: string[];
	outcomePrices: string;
	outcomes: string;
	acceptingOrders: boolean;
	active: boolean;
}

interface PolymarketResponse {
	data: PolymarketMarket[];
	next_cursor?: string;
}

/**
 * Kalshi API response types
 */
interface KalshiMarket {
	ticker: string;
	title: string;
	subtitle?: string;
	category: string;
	status: string;
	yes_bid: number;
	yes_ask: number;
	no_bid: number;
	no_ask: number;
	volume: number;
	volume_24h: number;
	open_interest: number;
	close_time: string;
}

interface KalshiResponse {
	markets: KalshiMarket[];
	cursor?: string;
}

/**
 * Category mapping for Polymarket markets
 */
function categorizeMarket(question: string): string {
	const q = question.toLowerCase();

	if (q.includes('china') || q.includes('russia') || q.includes('war') || q.includes('conflict') || q.includes('military')) {
		return 'geopolitics';
	}
	if (q.includes('bitcoin') || q.includes('crypto') || q.includes('ethereum')) {
		return 'crypto';
	}
	if (q.includes('fed') || q.includes('rate') || q.includes('inflation') || q.includes('gdp') || q.includes('recession')) {
		return 'macro';
	}
	if (q.includes('ai') || q.includes('tech') || q.includes('openai') || q.includes('google')) {
		return 'tech';
	}
	if (q.includes('trump') || q.includes('biden') || q.includes('election') || q.includes('president')) {
		return 'politics';
	}
	if (q.includes('oil') || q.includes('gold') || q.includes('commodity')) {
		return 'commodities';
	}
	if (q.includes('tariff') || q.includes('trade')) {
		return 'trade';
	}
	if (q.includes('cyber') || q.includes('hack')) {
		return 'cyber';
	}
	if (q.includes('s&p') || q.includes('nasdaq') || q.includes('dow') || q.includes('stock')) {
		return 'markets';
	}

	return 'other';
}

/**
 * Fetch predictions from Polymarket API
 */
async function fetchFromPolymarket(): Promise<Prediction[]> {
	try {
		await rateLimiters.polymarket.throttle();

		// Fetch open markets sorted by 24-hour volume
		const url = `${API_URLS.polymarket}/markets?limit=20&closed=false&order=volume24hr&ascending=false`;
		const response = await fetchWithProxy(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		// Handle different response formats
		const markets: PolymarketMarket[] = Array.isArray(data) ? data : data.data || [];

		if (markets.length === 0) {
			throw new Error('No markets returned from Polymarket');
		}

		return markets
			.filter((m) => m.active && m.volume > 10000) // Filter for active markets with some volume
			.map((market) => {
				// Parse outcome prices (format: "[0.65, 0.35]" for Yes/No)
				let probability = 0.5;
				try {
					const prices = JSON.parse(market.outcomePrices || '[]');
					if (prices.length > 0) {
						probability = parseFloat(prices[0]) || 0.5;
					}
				} catch {
					// Use default probability
				}

				return {
					id: market.id || market.conditionId,
					question: market.question,
					probability,
					volume: market.volume || 0,
					category: categorizeMarket(market.question),
					endDate: market.endDate ? new Date(market.endDate) : undefined,
					lastUpdated: new Date()
				};
			})
			.sort((a, b) => b.volume - a.volume) // Sort by volume
			.slice(0, 15); // Top 15 markets
	} catch (error) {
		logger.warn('Polymarket', 'Failed to fetch from Polymarket:', error);
		throw error;
	}
}

/**
 * Fetch predictions from Kalshi API (backup)
 */
async function fetchFromKalshi(): Promise<Prediction[]> {
	try {
		// Kalshi public API
		const url = `${API_URLS.kalshi}/markets?limit=20&status=open`;
		const response = await fetchWithProxy(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: KalshiResponse = await response.json();
		const markets = data.markets || [];

		if (markets.length === 0) {
			throw new Error('No markets returned from Kalshi');
		}

		return markets
			.filter((m) => m.status === 'open' && m.volume > 1000)
			.map((market) => ({
				id: market.ticker,
				question: market.title + (market.subtitle ? ` - ${market.subtitle}` : ''),
				probability: (market.yes_bid + market.yes_ask) / 200, // Convert cents to probability
				volume: market.volume * 100, // Convert to dollar value
				category: categorizeMarket(market.title),
				endDate: market.close_time ? new Date(market.close_time) : undefined,
				lastUpdated: new Date()
			}))
			.sort((a, b) => b.volume - a.volume)
			.slice(0, 15);
	} catch (error) {
		logger.warn('Polymarket', 'Failed to fetch from Kalshi:', error);
		throw error;
	}
}

/**
 * Fetch Polymarket predictions with fallback to Kalshi
 * Tries Polymarket first, then Kalshi. Throws if both fail.
 */
export async function fetchPolymarket(): Promise<Prediction[]> {
	// Try Polymarket first
	try {
		logger.log('Polymarket', 'Fetching from Polymarket API');
		const predictions = await fetchFromPolymarket();
		if (predictions.length > 0) {
			logger.log('Polymarket', `Successfully fetched ${predictions.length} predictions from Polymarket`);
			return predictions;
		}
	} catch (err) {
		logger.warn('Polymarket', 'Polymarket API failed, trying Kalshi');
	}

	// Try Kalshi as backup
	try {
		logger.log('Polymarket', 'Fetching from Kalshi API');
		const predictions = await fetchFromKalshi();
		if (predictions.length > 0) {
			logger.log('Polymarket', `Successfully fetched ${predictions.length} predictions from Kalshi`);
			return predictions;
		}
	} catch (err) {
		logger.error('Polymarket', 'Both Polymarket and Kalshi APIs failed');
	}

	// Both APIs failed - return empty array (panel will show error state)
	throw new Error('Failed to fetch prediction market data from all sources');
}

/**
 * Sectors API - Finnhub integration for sector ETF data
 *
 * Uses sector ETFs as proxies for overall sector performance.
 * Falls back to mock data if no API key is provided.
 */

import { FINNHUB_API_KEY, API_URLS, logger, fetchWithProxy } from '$lib/config';
import { rateLimiters } from '$lib/services';
import type { SectorPerformance } from '$lib/types';

/**
 * Sector ETF configuration
 * Each ETF represents a major market sector
 */
export const SECTOR_ETFS = [
	{ symbol: 'XLK', name: 'Tech', fullName: 'Technology Select Sector SPDR' },
	{ symbol: 'XLF', name: 'Financials', fullName: 'Financial Select Sector SPDR' },
	{ symbol: 'XLE', name: 'Energy', fullName: 'Energy Select Sector SPDR' },
	{ symbol: 'XLV', name: 'Healthcare', fullName: 'Health Care Select Sector SPDR' },
	{ symbol: 'XLY', name: 'Consumer', fullName: 'Consumer Discretionary SPDR' },
	{ symbol: 'XLI', name: 'Industrials', fullName: 'Industrial Select Sector SPDR' },
	{ symbol: 'XLP', name: 'Staples', fullName: 'Consumer Staples Select Sector SPDR' },
	{ symbol: 'XLU', name: 'Utilities', fullName: 'Utilities Select Sector SPDR' },
	{ symbol: 'XLB', name: 'Materials', fullName: 'Materials Select Sector SPDR' },
	{ symbol: 'XLRE', name: 'Real Estate', fullName: 'Real Estate Select Sector SPDR' },
	{ symbol: 'XLC', name: 'Comms', fullName: 'Communication Services Select Sector SPDR' },
	{ symbol: 'SMH', name: 'Semis', fullName: 'VanEck Semiconductor ETF' }
] as const;

/**
 * Mock sector data for fallback
 */
const MOCK_SECTORS: SectorPerformance[] = [
	{ symbol: 'XLK', name: 'Tech', price: 220.5, change: 3.2, changePercent: 1.47 },
	{ symbol: 'XLF', name: 'Financials', price: 42.8, change: 0.5, changePercent: 1.18 },
	{ symbol: 'XLV', name: 'Healthcare', price: 145.2, change: -0.8, changePercent: -0.55 },
	{ symbol: 'XLE', name: 'Energy', price: 88.3, change: -1.5, changePercent: -1.67 },
	{ symbol: 'XLY', name: 'Consumer', price: 198.4, change: 2.1, changePercent: 1.07 },
	{ symbol: 'XLI', name: 'Industrials', price: 125.6, change: 0.9, changePercent: 0.72 },
	{ symbol: 'XLP', name: 'Staples', price: 78.9, change: -0.2, changePercent: -0.25 },
	{ symbol: 'XLU', name: 'Utilities', price: 72.4, change: 0.3, changePercent: 0.42 },
	{ symbol: 'XLB', name: 'Materials', price: 89.7, change: -0.6, changePercent: -0.66 },
	{ symbol: 'XLRE', name: 'Real Estate', price: 42.1, change: 0.1, changePercent: 0.24 },
	{ symbol: 'XLC', name: 'Comms', price: 82.5, change: 1.8, changePercent: 2.23 },
	{ symbol: 'SMH', name: 'Semis', price: 245.8, change: 5.2, changePercent: 2.16 }
];

/**
 * Finnhub quote response type
 */
interface FinnhubQuote {
	c: number; // Current price
	d: number; // Change
	dp: number; // Percent change
	h: number; // High
	l: number; // Low
	o: number; // Open
	pc: number; // Previous close
	t: number; // Timestamp
}

/**
 * Fetch a single sector ETF quote from Finnhub
 */
async function fetchFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
	try {
		// Respect rate limits
		await rateLimiters.finnhub.throttle();

		const url = `${API_URLS.finnhub}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
		const response = await fetchWithProxy(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();

		// Check if we got valid data (Finnhub returns zeros for invalid symbols)
		if (!data.c || data.c === 0) {
			return null;
		}

		return data as FinnhubQuote;
	} catch (error) {
		logger.warn('Sectors', `Failed to fetch ${symbol}:`, error);
		return null;
	}
}

/**
 * Fetch all sector data from Finnhub API
 * Returns real data if API key is available, otherwise returns mock data
 */
export async function fetchSectorData(): Promise<SectorPerformance[]> {
	// If no API key, return mock data with slight variation
	if (!FINNHUB_API_KEY) {
		logger.debug('Sectors', 'No Finnhub API key, using mock data');
		return MOCK_SECTORS.map((s) => ({
			...s,
			changePercent: s.changePercent + (Math.random() - 0.5) * 0.2
		}));
	}

	try {
		logger.log('Sectors', 'Fetching sector data from Finnhub');

		// Fetch all sector ETFs in sequence (to respect rate limits)
		const results: SectorPerformance[] = [];

		for (const etf of SECTOR_ETFS) {
			const quote = await fetchFinnhubQuote(etf.symbol);

			if (quote) {
				results.push({
					symbol: etf.symbol,
					name: etf.name,
					price: quote.c,
					change: quote.d,
					changePercent: quote.dp
				});
			} else {
				// Use mock data for this sector if fetch failed
				const mockSector = MOCK_SECTORS.find((s) => s.symbol === etf.symbol);
				if (mockSector) {
					results.push({
						...mockSector,
						changePercent: mockSector.changePercent + (Math.random() - 0.5) * 0.2
					});
				}
			}
		}

		// If we got less than half the sectors, fall back to mock entirely
		if (results.length < SECTOR_ETFS.length / 2) {
			logger.warn('Sectors', 'Too few sectors fetched, falling back to mock data');
			return MOCK_SECTORS.map((s) => ({
				...s,
				changePercent: s.changePercent + (Math.random() - 0.5) * 0.2
			}));
		}

		logger.log('Sectors', `Successfully fetched ${results.length} sectors`);
		return results;
	} catch (error) {
		logger.error('Sectors', 'Failed to fetch sector data:', error);

		// Return mock data on error
		return MOCK_SECTORS.map((s) => ({
			...s,
			changePercent: s.changePercent + (Math.random() - 0.5) * 0.2
		}));
	}
}

/**
 * Get mock sector data (for testing or when API is unavailable)
 */
export function getMockSectorData(): SectorPerformance[] {
	return MOCK_SECTORS.map((s) => ({
		...s,
		changePercent: s.changePercent + (Math.random() - 0.5) * 0.2
	}));
}

/**
 * Check if Finnhub API key is configured
 */
export function hasApiKey(): boolean {
	return !!FINNHUB_API_KEY;
}

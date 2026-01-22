/**
 * Markets API - Stock indices, prices, and commodities
 */

import { marketClient } from '$lib/services';
import { INDICES, STOCKS, COMMODITIES, FOREX, API_URLS, FINNHUB_API_KEY, logger } from '$lib/config';
import type { MarketData, CommodityData } from '$lib/types';

/**
 * Yahoo Finance API (no key required, but rate limited)
 * Uses a CORS proxy
 */
async function fetchYahooQuote(symbol: string): Promise<MarketData | null> {
	try {
		// Yahoo Finance v8 API
		const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

		const response = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();
		const result = data?.chart?.result?.[0];

		if (!result) {
			return null;
		}

		const meta = result.meta;
		const quote = result.indicators?.quote?.[0];
		const prevClose = meta.previousClose || meta.chartPreviousClose;
		const price = meta.regularMarketPrice || quote?.close?.[quote.close.length - 1];

		if (!price) return null;

		const change = price - prevClose;
		const changePercent = (change / prevClose) * 100;

		return {
			symbol,
			name: meta.shortName || meta.symbol,
			price,
			change,
			changePercent,
			high: meta.regularMarketDayHigh,
			low: meta.regularMarketDayLow,
			volume: meta.regularMarketVolume,
			lastUpdated: new Date()
		};
	} catch (err) {
		logger.warn('Markets', `Failed to fetch ${symbol}:`, err);
		return null;
	}
}

/**
 * Finnhub API (free tier, 60 calls/min)
 */
async function fetchFinnhubQuote(symbol: string): Promise<MarketData | null> {
	if (!FINNHUB_API_KEY) {
		return null;
	}

	try {
		const url = `${API_URLS.finnhub}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();

		if (!data.c) {
			return null;
		}

		return {
			symbol,
			name: symbol,
			price: data.c, // Current price
			change: data.d, // Change
			changePercent: data.dp, // Change percent
			high: data.h, // High
			low: data.l, // Low
			lastUpdated: new Date()
		};
	} catch (err) {
		logger.warn('Markets', `Finnhub failed for ${symbol}:`, err);
		return null;
	}
}

/**
 * Fetch market data with fallback
 */
async function fetchQuote(symbol: string, name: string): Promise<MarketData | null> {
	// Try Yahoo first (no API key needed)
	let quote = await fetchYahooQuote(symbol);

	// Fallback to Finnhub for stocks
	if (!quote && FINNHUB_API_KEY && !symbol.startsWith('^')) {
		quote = await fetchFinnhubQuote(symbol);
	}

	if (quote) {
		quote.name = name;
	}

	return quote;
}

/**
 * Fetch all major indices
 */
export async function fetchIndices(): Promise<MarketData[]> {
	const results = await Promise.allSettled(
		INDICES.map((idx) => fetchQuote(idx.symbol, idx.name))
	);

	return results
		.filter((r): r is PromiseFulfilledResult<MarketData | null> => r.status === 'fulfilled')
		.map((r) => r.value)
		.filter((v): v is MarketData => v !== null);
}

/**
 * Fetch major stocks
 */
export async function fetchStocks(): Promise<MarketData[]> {
	const results = await Promise.allSettled(
		STOCKS.map((stock) => fetchQuote(stock.symbol, stock.name))
	);

	return results
		.filter((r): r is PromiseFulfilledResult<MarketData | null> => r.status === 'fulfilled')
		.map((r) => r.value)
		.filter((v): v is MarketData => v !== null);
}

/**
 * Fetch commodities
 */
export async function fetchCommodities(): Promise<CommodityData[]> {
	const results = await Promise.allSettled(
		COMMODITIES.map(async (commodity) => {
			const quote = await fetchQuote(commodity.symbol, commodity.name);
			if (!quote) return null;

			return {
				symbol: commodity.symbol,
				name: commodity.name,
				price: quote.price,
				change: quote.change,
				changePercent: quote.changePercent,
				unit: getUnit(commodity.symbol),
				lastUpdated: quote.lastUpdated
			};
		})
	);

	return results
		.filter((r): r is PromiseFulfilledResult<CommodityData | null> => r.status === 'fulfilled')
		.map((r) => r.value)
		.filter((v): v is CommodityData => v !== null);
}

/**
 * Fetch forex rates
 */
export async function fetchForex(): Promise<MarketData[]> {
	const results = await Promise.allSettled(
		FOREX.map((pair) => fetchQuote(pair.symbol, pair.name))
	);

	return results
		.filter((r): r is PromiseFulfilledResult<MarketData | null> => r.status === 'fulfilled')
		.map((r) => r.value)
		.filter((v): v is MarketData => v !== null);
}

/**
 * Fetch all market data
 */
export async function fetchAllMarkets(): Promise<{
	indices: MarketData[];
	stocks: MarketData[];
	commodities: CommodityData[];
	forex: MarketData[];
}> {
	const [indices, stocks, commodities, forex] = await Promise.all([
		fetchIndices(),
		fetchStocks(),
		fetchCommodities(),
		fetchForex()
	]);

	return { indices, stocks, commodities, forex };
}

/**
 * Get unit for commodity
 */
function getUnit(symbol: string): string {
	const units: Record<string, string> = {
		'GC=F': '/oz',
		'SI=F': '/oz',
		'CL=F': '/bbl',
		'NG=F': '/MMBtu',
		'HG=F': '/lb',
		'ZC=F': '/bu',
		'ZW=F': '/bu'
	};
	return units[symbol] || '';
}

/**
 * FRED API - Federal Reserve Economic Data
 *
 * Provides access to treasury yields, macro indicators, and economic data.
 * Falls back to mock data if no API key is provided.
 */

import { FRED_API_KEY, API_URLS, logger, fetchWithProxy } from '$lib/config';
import { rateLimiters } from '$lib/services';
import type { EconomicIndicator, YieldCurvePoint } from '$lib/types';

/**
 * FRED API observation response type
 */
interface FredObservation {
	date: string;
	value: string;
}

interface FredSeriesResponse {
	observations: FredObservation[];
}

/**
 * Treasury yield series IDs
 */
export const TREASURY_SERIES = {
	'1M': 'DGS1MO',
	'3M': 'DGS3MO',
	'6M': 'DGS6MO',
	'1Y': 'DGS1',
	'2Y': 'DGS2',
	'5Y': 'DGS5',
	'7Y': 'DGS7',
	'10Y': 'DGS10',
	'20Y': 'DGS20',
	'30Y': 'DGS30'
} as const;

/**
 * Key macro indicator series
 */
export const MACRO_SERIES = {
	// Rates
	FEDFUNDS: { name: 'Fed Funds Rate', shortName: 'Fed Funds', unit: '%', category: 'rates' },
	MORTGAGE30US: { name: '30-Year Mortgage', shortName: '30Y Mortgage', unit: '%', category: 'rates' },
	MORTGAGE15US: { name: '15-Year Mortgage', shortName: '15Y Mortgage', unit: '%', category: 'rates' },

	// Inflation (need YoY calculation)
	CPIAUCSL: { name: 'CPI YoY', shortName: 'CPI', unit: '%', category: 'inflation', needsYoY: true },
	CPILFESL: { name: 'Core CPI YoY', shortName: 'Core CPI', unit: '%', category: 'inflation', needsYoY: true },
	PCEPILFE: { name: 'Core PCE YoY', shortName: 'Core PCE', unit: '%', category: 'inflation', needsYoY: true },

	// Employment
	UNRATE: { name: 'Unemployment Rate', shortName: 'Unemployment', unit: '%', category: 'employment' },
	PAYEMS: { name: 'Nonfarm Payrolls', shortName: 'NFP', unit: 'K', category: 'employment', scale: 1 },
	ICSA: { name: 'Initial Claims', shortName: 'Claims', unit: 'K', category: 'employment', scale: 1 },

	// Growth
	A191RL1Q225SBEA: { name: 'Real GDP Growth', shortName: 'GDP', unit: '%', category: 'growth' },
	INDPRO: { name: 'Industrial Production', shortName: 'IP', unit: '%', category: 'growth', needsChange: true },

	// Money
	M2SL: { name: 'M2 YoY', shortName: 'M2', unit: '%', category: 'money', needsYoY: true },
	WALCL: { name: 'Fed Balance Sheet', shortName: 'Fed BS', unit: 'T', category: 'money', scale: 1e-6 },

	// Consumer
	RSXFS: { name: 'Retail Sales YoY', shortName: 'Retail', unit: '%', category: 'consumer', needsYoY: true },
	UMCSENT: { name: 'Michigan Sentiment', shortName: 'UMich', unit: '', category: 'consumer' },

	// Housing
	HOUST: { name: 'Housing Starts', shortName: 'Starts', unit: 'M', category: 'housing', scale: 0.001 },
	EXHOSLUSM495S: { name: 'Existing Home Sales', shortName: 'EHS', unit: 'M', category: 'housing' }
} as const;

/**
 * Mock treasury yield data
 */
const MOCK_YIELDS: YieldCurvePoint[] = [
	{ maturity: '1M', rate: 5.32, change: -0.02, date: new Date() },
	{ maturity: '3M', rate: 5.28, change: -0.01, date: new Date() },
	{ maturity: '6M', rate: 5.15, change: -0.03, date: new Date() },
	{ maturity: '1Y', rate: 4.89, change: -0.05, date: new Date() },
	{ maturity: '2Y', rate: 4.42, change: -0.08, date: new Date() },
	{ maturity: '5Y', rate: 4.18, change: -0.06, date: new Date() },
	{ maturity: '10Y', rate: 4.28, change: -0.04, date: new Date() },
	{ maturity: '30Y', rate: 4.52, change: -0.02, date: new Date() }
];

/**
 * Mock macro indicator data
 */
const MOCK_INDICATORS: EconomicIndicator[] = [
	{ id: '1', seriesId: 'FEDFUNDS', name: 'Fed Funds Rate', shortName: 'Fed Funds', value: 5.33, previousValue: 5.33, unit: '%', category: 'rates', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '2', seriesId: 'MORTGAGE30US', name: '30-Year Mortgage', shortName: '30Y Mortgage', value: 6.91, previousValue: 6.84, unit: '%', category: 'rates', frequency: 'weekly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '3', seriesId: 'CPIAUCSL', name: 'CPI YoY', shortName: 'CPI', value: 2.9, previousValue: 2.7, unit: '%', category: 'inflation', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '4', seriesId: 'CPILFESL', name: 'Core CPI YoY', shortName: 'Core CPI', value: 3.2, previousValue: 3.3, unit: '%', category: 'inflation', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '5', seriesId: 'PCEPILFE', name: 'Core PCE YoY', shortName: 'Core PCE', value: 2.8, previousValue: 2.8, unit: '%', category: 'inflation', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '6', seriesId: 'UNRATE', name: 'Unemployment Rate', shortName: 'Unemployment', value: 4.1, previousValue: 4.2, unit: '%', category: 'employment', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '7', seriesId: 'PAYEMS', name: 'Nonfarm Payrolls', shortName: 'NFP', value: 256, previousValue: 212, unit: 'K', category: 'employment', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '8', seriesId: 'ICSA', name: 'Initial Claims', shortName: 'Claims', value: 217, previousValue: 220, unit: 'K', category: 'employment', frequency: 'weekly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '9', seriesId: 'A191RL1Q225SBEA', name: 'Real GDP Growth', shortName: 'GDP', value: 3.1, previousValue: 2.8, unit: '%', category: 'growth', frequency: 'quarterly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '10', seriesId: 'INDPRO', name: 'Industrial Production', shortName: 'IP', value: 0.1, previousValue: -0.4, unit: '%', category: 'growth', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '11', seriesId: 'M2SL', name: 'M2 YoY', shortName: 'M2', value: 3.9, previousValue: 3.5, unit: '%', category: 'money', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '12', seriesId: 'WALCL', name: 'Fed Balance Sheet', shortName: 'Fed BS', value: 6.89, previousValue: 6.92, unit: 'T', category: 'money', frequency: 'weekly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '13', seriesId: 'RSXFS', name: 'Retail Sales YoY', shortName: 'Retail', value: 3.6, previousValue: 2.9, unit: '%', category: 'consumer', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '14', seriesId: 'UMCSENT', name: 'Michigan Sentiment', shortName: 'UMich', value: 73.2, previousValue: 74.0, unit: '', category: 'consumer', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '15', seriesId: 'HOUST', name: 'Housing Starts', shortName: 'Starts', value: 1.289, previousValue: 1.311, unit: 'M', category: 'housing', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' },
	{ id: '16', seriesId: 'EXHOSLUSM495S', name: 'Existing Home Sales', shortName: 'EHS', value: 4.15, previousValue: 3.96, unit: 'M', category: 'housing', frequency: 'monthly', lastUpdated: new Date(), source: 'FRED' }
];

/**
 * Fetch observations for a FRED series
 */
async function fetchFredSeries(seriesId: string, limit: number = 2): Promise<FredObservation[]> {
	try {
		await rateLimiters.fred.throttle();

		const url = `${API_URLS.fred}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=${limit}&sort_order=desc`;
		const response = await fetchWithProxy(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: FredSeriesResponse = await response.json();
		return data.observations || [];
	} catch (error) {
		logger.warn('FRED', `Failed to fetch ${seriesId}:`, error);
		return [];
	}
}

/**
 * Fetch observations for YoY calculation (need 13 observations)
 */
async function fetchFredSeriesForYoY(seriesId: string): Promise<FredObservation[]> {
	try {
		await rateLimiters.fred.throttle();

		const url = `${API_URLS.fred}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=14&sort_order=desc`;
		const response = await fetchWithProxy(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: FredSeriesResponse = await response.json();
		return data.observations || [];
	} catch (error) {
		logger.warn('FRED', `Failed to fetch ${seriesId} for YoY:`, error);
		return [];
	}
}

/**
 * Calculate year-over-year change
 */
function calculateYoY(observations: FredObservation[]): { current: number; yoy: number; previousYoy: number } | null {
	// Need at least 13 observations (current + 12 months ago)
	if (observations.length < 13) return null;

	const current = parseFloat(observations[0].value);
	const yearAgo = parseFloat(observations[12].value);
	const previous = parseFloat(observations[1].value);
	const prevYearAgo = parseFloat(observations[13]?.value || observations[12].value);

	if (isNaN(current) || isNaN(yearAgo) || current === 0 || yearAgo === 0) return null;

	const yoy = ((current - yearAgo) / yearAgo) * 100;
	const previousYoy = ((previous - prevYearAgo) / prevYearAgo) * 100;

	return { current, yoy, previousYoy };
}

/**
 * Fetch treasury yield data
 */
export async function fetchTreasuryYields(): Promise<YieldCurvePoint[]> {
	if (!FRED_API_KEY) {
		logger.debug('FRED', 'No API key, using mock yield data');
		return MOCK_YIELDS.map((y) => ({
			...y,
			rate: y.rate + (Math.random() - 0.5) * 0.05
		}));
	}

	try {
		logger.log('FRED', 'Fetching treasury yields');

		const maturities: Array<{ key: string; seriesId: string }> = [
			{ key: '1M', seriesId: 'DGS1MO' },
			{ key: '3M', seriesId: 'DGS3MO' },
			{ key: '6M', seriesId: 'DGS6MO' },
			{ key: '1Y', seriesId: 'DGS1' },
			{ key: '2Y', seriesId: 'DGS2' },
			{ key: '5Y', seriesId: 'DGS5' },
			{ key: '10Y', seriesId: 'DGS10' },
			{ key: '30Y', seriesId: 'DGS30' }
		];

		const results: YieldCurvePoint[] = [];

		for (const { key, seriesId } of maturities) {
			const observations = await fetchFredSeries(seriesId, 2);

			if (observations.length >= 1) {
				const current = parseFloat(observations[0].value);
				const previous = observations.length >= 2 ? parseFloat(observations[1].value) : current;

				if (!isNaN(current) && current !== 0) {
					results.push({
						maturity: key,
						rate: current,
						change: current - previous,
						date: new Date(observations[0].date)
					});
				}
			}
		}

		// If we got less than half, fall back to mock
		if (results.length < maturities.length / 2) {
			logger.warn('FRED', 'Too few yields fetched, using mock data');
			return MOCK_YIELDS;
		}

		logger.log('FRED', `Successfully fetched ${results.length} treasury yields`);
		return results;
	} catch (error) {
		logger.error('FRED', 'Failed to fetch treasury yields:', error);
		return MOCK_YIELDS;
	}
}

/**
 * Fetch macro indicator data
 */
export async function fetchMacroIndicators(): Promise<EconomicIndicator[]> {
	if (!FRED_API_KEY) {
		logger.debug('FRED', 'No API key, using mock indicator data');
		return MOCK_INDICATORS;
	}

	try {
		logger.log('FRED', 'Fetching macro indicators');

		const results: EconomicIndicator[] = [];
		let id = 1;

		for (const [seriesId, config] of Object.entries(MACRO_SERIES)) {
			try {
				let value: number;
				let previousValue: number;

				if ('needsYoY' in config && config.needsYoY) {
					// Fetch more observations for YoY calculation
					const observations = await fetchFredSeriesForYoY(seriesId);
					const yoyData = calculateYoY(observations);

					if (!yoyData) continue;

					value = parseFloat(yoyData.yoy.toFixed(1));
					previousValue = parseFloat(yoyData.previousYoy.toFixed(1));
				} else {
					// Fetch just latest 2 observations
					const observations = await fetchFredSeries(seriesId, 2);

					if (observations.length < 1) continue;

					value = parseFloat(observations[0].value);
					previousValue = observations.length >= 2 ? parseFloat(observations[1].value) : value;

					if (isNaN(value) || value === 0) continue;

					// Apply scaling if needed
					const scale = (config as { scale?: number }).scale;
					if (scale) {
						value = value * scale;
						previousValue = previousValue * scale;
					}
				}

				results.push({
					id: String(id++),
					seriesId,
					name: config.name,
					shortName: config.shortName,
					value,
					previousValue,
					unit: config.unit,
					category: config.category as EconomicIndicator['category'],
					frequency: 'monthly',
					lastUpdated: new Date(),
					source: 'FRED'
				});
			} catch (err) {
				logger.warn('FRED', `Failed to fetch ${seriesId}:`, err);
			}
		}

		// If we got less than half, fall back to mock
		if (results.length < Object.keys(MACRO_SERIES).length / 2) {
			logger.warn('FRED', 'Too few indicators fetched, using mock data');
			return MOCK_INDICATORS;
		}

		logger.log('FRED', `Successfully fetched ${results.length} macro indicators`);
		return results;
	} catch (error) {
		logger.error('FRED', 'Failed to fetch macro indicators:', error);
		return MOCK_INDICATORS;
	}
}

/**
 * Fetch a specific FRED series
 */
export async function fetchFredIndicator(seriesId: string): Promise<{ value: number; previousValue: number; date: Date } | null> {
	if (!FRED_API_KEY) {
		return null;
	}

	const observations = await fetchFredSeries(seriesId, 2);

	if (observations.length < 1) return null;

	const value = parseFloat(observations[0].value);
	const previousValue = observations.length >= 2 ? parseFloat(observations[1].value) : value;

	if (isNaN(value)) return null;

	return {
		value,
		previousValue,
		date: new Date(observations[0].date)
	};
}

/**
 * Get mock yield data (for testing or when API is unavailable)
 */
export function getMockYields(): YieldCurvePoint[] {
	return MOCK_YIELDS.map((y) => ({
		...y,
		rate: y.rate + (Math.random() - 0.5) * 0.05
	}));
}

/**
 * Get mock indicator data (for testing or when API is unavailable)
 */
export function getMockIndicators(): EconomicIndicator[] {
	return MOCK_INDICATORS;
}

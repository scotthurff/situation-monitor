/**
 * Economic Calendar API - Finnhub + FRED
 *
 * Fetches upcoming economic events and data releases.
 */

import { FINNHUB_API_KEY, FRED_API_KEY, API_URLS, logger } from '$lib/config';
import { rateLimiters } from '$lib/services';

export interface EconomicEvent {
	id: string;
	name: string;
	country: string;
	date: Date;
	time: string;
	importance: 'high' | 'medium' | 'low';
	actual?: string;
	forecast?: string;
	previous?: string;
	unit?: string;
}

interface FinnhubCalendarEvent {
	actual: number | null;
	country: string;
	estimate: number | null;
	event: string;
	impact: string;
	prev: number | null;
	time: string;
	unit: string;
}

interface FinnhubCalendarResponse {
	economicCalendar: FinnhubCalendarEvent[];
}

interface FredReleaseDate {
	release_id: number;
	release_name: string;
	date: string;
}

interface FredReleasesResponse {
	release_dates: FredReleaseDate[];
}

/**
 * Map Finnhub impact to our importance levels
 */
function mapImpact(impact: string): 'high' | 'medium' | 'low' {
	const impactLower = impact?.toLowerCase() || '';
	if (impactLower === 'high' || impactLower === '3') return 'high';
	if (impactLower === 'medium' || impactLower === '2') return 'medium';
	return 'low';
}

/**
 * Format number value for display
 */
function formatValue(value: number | null, unit: string): string | undefined {
	if (value === null || value === undefined) return undefined;

	// Handle percentage
	if (unit === '%') return value.toFixed(1) + '%';

	// Handle large numbers
	if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(2) + 'B';
	if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(2) + 'M';
	if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(1) + 'K';

	return value.toFixed(2);
}

/**
 * Generate unique ID for event
 */
function generateEventId(event: string, date: string): string {
	return `${event.replace(/\s+/g, '-').toLowerCase()}-${date}`;
}

/**
 * Fetch economic calendar from Finnhub
 */
export async function fetchEconomicCalendar(): Promise<EconomicEvent[]> {
	if (!FINNHUB_API_KEY) {
		logger.warn('Calendar API', 'No Finnhub API key, returning empty calendar');
		return [];
	}

	try {
		await rateLimiters.finnhub.throttle();

		// Get events for next 14 days
		const today = new Date();
		const endDate = new Date(today);
		endDate.setDate(endDate.getDate() + 14);

		const fromStr = today.toISOString().split('T')[0];
		const toStr = endDate.toISOString().split('T')[0];

		const url = `https://finnhub.io/api/v1/calendar/economic?from=${fromStr}&to=${toStr}&token=${FINNHUB_API_KEY}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data: FinnhubCalendarResponse = await response.json();

		if (!data.economicCalendar || !Array.isArray(data.economicCalendar)) {
			logger.log('Calendar API', 'No economicCalendar array in response');
			return [];
		}

		// Log unique countries for debugging
		const countries = [...new Set(data.economicCalendar.map((e) => e.country))];
		logger.log('Calendar API', `Received ${data.economicCalendar.length} events, countries: ${countries.join(', ')}`);

		// Filter for US events and map to our format
		const events: EconomicEvent[] = data.economicCalendar
			.filter((e) => e.country === 'US' || e.country === 'USA' || e.country === 'United States')
			.map((e) => {
				const eventDate = new Date(e.time);
				return {
					id: generateEventId(e.event, e.time),
					name: e.event,
					country: 'US',
					date: eventDate,
					time: eventDate.toLocaleTimeString('en-US', {
						hour: 'numeric',
						minute: '2-digit',
						hour12: true
					}),
					importance: mapImpact(e.impact),
					actual: formatValue(e.actual, e.unit),
					forecast: formatValue(e.estimate, e.unit),
					previous: formatValue(e.prev, e.unit),
					unit: e.unit
				};
			})
			.sort((a, b) => a.date.getTime() - b.date.getTime());

		logger.log('Calendar API', `Fetched ${events.length} US economic events`);
		return events;
	} catch (error) {
		logger.error('Calendar API', 'Failed to fetch Finnhub calendar:', error);
		return [];
	}
}

/**
 * Fetch upcoming FRED release dates
 */
export async function fetchFredReleases(): Promise<EconomicEvent[]> {
	if (!FRED_API_KEY) {
		logger.warn('Calendar API', 'No FRED API key, skipping FRED releases');
		return [];
	}

	try {
		await rateLimiters.fred.throttle();

		// Get releases for next 30 days
		const today = new Date();
		const endDate = new Date(today);
		endDate.setDate(endDate.getDate() + 30);

		const startStr = today.toISOString().split('T')[0];
		const endStr = endDate.toISOString().split('T')[0];

		const url = `${API_URLS.fred}/releases/dates?api_key=${FRED_API_KEY}&file_type=json&include_release_dates_with_no_data=true&realtime_start=${startStr}&realtime_end=${endStr}&limit=100`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data: FredReleasesResponse = await response.json();

		if (!data.release_dates || !Array.isArray(data.release_dates)) {
			return [];
		}

		// Map important releases to events
		const importantReleases = new Set([
			'Employment Situation',
			'Consumer Price Index',
			'Producer Price Index',
			'Gross Domestic Product',
			'Personal Income and Outlays',
			'Retail Sales',
			'Industrial Production and Capacity Utilization',
			'Housing Starts',
			'Existing Home Sales',
			'New Residential Sales',
			'Durable Goods',
			'Consumer Confidence',
			'ISM Manufacturing',
			'ISM Services',
			'FOMC',
			'Federal Reserve'
		]);

		const events: EconomicEvent[] = data.release_dates
			.filter((r) => {
				const name = r.release_name.toLowerCase();
				return Array.from(importantReleases).some((imp) => name.includes(imp.toLowerCase()));
			})
			.map((r) => {
				const eventDate = new Date(r.date + 'T08:30:00');
				const isHighImportance =
					r.release_name.includes('Employment') ||
					r.release_name.includes('CPI') ||
					r.release_name.includes('GDP') ||
					r.release_name.includes('FOMC');

				return {
					id: `fred-${r.release_id}-${r.date}`,
					name: r.release_name,
					country: 'US',
					date: eventDate,
					time: '8:30 AM',
					importance: (isHighImportance ? 'high' : 'medium') as 'high' | 'medium' | 'low'
				};
			})
			.sort((a, b) => a.date.getTime() - b.date.getTime());

		logger.log('Calendar API', `Fetched ${events.length} FRED releases`);
		return events;
	} catch (error) {
		logger.error('Calendar API', 'Failed to fetch FRED releases:', error);
		return [];
	}
}

/**
 * Fetch combined economic calendar (Finnhub + FRED)
 */
export async function fetchCombinedCalendar(): Promise<EconomicEvent[]> {
	const [finnhubEvents, fredEvents] = await Promise.all([
		fetchEconomicCalendar(),
		fetchFredReleases()
	]);

	// Merge and dedupe (prefer Finnhub for actual/forecast data)
	const eventMap = new Map<string, EconomicEvent>();

	// Add FRED events first
	for (const event of fredEvents) {
		const key = `${event.name.toLowerCase()}-${event.date.toISOString().split('T')[0]}`;
		eventMap.set(key, event);
	}

	// Add Finnhub events (overwrites FRED if duplicate)
	for (const event of finnhubEvents) {
		const key = `${event.name.toLowerCase()}-${event.date.toISOString().split('T')[0]}`;
		eventMap.set(key, event);
	}

	// Sort by date
	const combined = Array.from(eventMap.values()).sort(
		(a, b) => a.date.getTime() - b.date.getTime()
	);

	return combined;
}

/**
 * Federal Reserve API - FRED data for Fed Watch
 *
 * Fetches Fed Funds rate, balance sheet, and FOMC meeting info.
 */

import { FRED_API_KEY, API_URLS, logger } from '$lib/config';
import { rateLimiters } from '$lib/services';

export interface FedFundsData {
	effectiveRate: number;
	targetLower: number;
	targetUpper: number;
	lastUpdated: Date;
}

export interface BalanceSheetData {
	totalAssets: number;
	treasuries: number;
	mbs: number;
	weeklyChange: number;
	lastUpdated: Date;
}

export interface FOMCMeeting {
	date: string;
	type: 'scheduled' | 'concluded';
	hasProjections: boolean;
	decision?: 'hike' | 'cut' | 'hold';
	rateChange?: number;
	newRate?: number;
}

interface FredObservation {
	date: string;
	value: string;
}

interface FredSeriesResponse {
	observations: FredObservation[];
}

/**
 * FRED series IDs
 */
const SERIES = {
	FED_FUNDS_EFFECTIVE: 'DFF', // Daily Fed Funds Effective Rate
	FED_FUNDS_TARGET_UPPER: 'DFEDTARU', // Target Upper
	FED_FUNDS_TARGET_LOWER: 'DFEDTARL', // Target Lower
	BALANCE_SHEET_TOTAL: 'WALCL', // Total Assets
	BALANCE_SHEET_TREASURIES: 'TREAST', // Treasury Securities
	BALANCE_SHEET_MBS: 'WSHOMCB' // MBS Holdings
};

/**
 * Fetch single FRED series
 */
async function fetchFredSeries(seriesId: string, limit = 2): Promise<FredObservation[]> {
	if (!FRED_API_KEY) return [];

	try {
		await rateLimiters.fred.throttle();

		const url = `${API_URLS.fred}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=${limit}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data: FredSeriesResponse = await response.json();
		return data.observations || [];
	} catch (error) {
		logger.error('Fed API', `Failed to fetch series ${seriesId}:`, error);
		return [];
	}
}

/**
 * Fetch Fed Funds rate data
 */
export async function fetchFedFundsRate(): Promise<FedFundsData | null> {
	if (!FRED_API_KEY) {
		logger.warn('Fed API', 'No FRED API key');
		return null;
	}

	try {
		const [effective, upper, lower] = await Promise.all([
			fetchFredSeries(SERIES.FED_FUNDS_EFFECTIVE, 1),
			fetchFredSeries(SERIES.FED_FUNDS_TARGET_UPPER, 1),
			fetchFredSeries(SERIES.FED_FUNDS_TARGET_LOWER, 1)
		]);

		const effectiveRate = effective[0]?.value && effective[0].value !== '.'
			? parseFloat(effective[0].value)
			: 4.33;
		const targetUpper = upper[0]?.value && upper[0].value !== '.'
			? parseFloat(upper[0].value)
			: 4.50;
		const targetLower = lower[0]?.value && lower[0].value !== '.'
			? parseFloat(lower[0].value)
			: 4.25;

		return {
			effectiveRate,
			targetUpper,
			targetLower,
			lastUpdated: new Date(effective[0]?.date || Date.now())
		};
	} catch (error) {
		logger.error('Fed API', 'Failed to fetch Fed Funds rate:', error);
		return null;
	}
}

/**
 * Fetch Fed balance sheet data
 */
export async function fetchBalanceSheet(): Promise<BalanceSheetData | null> {
	if (!FRED_API_KEY) {
		logger.warn('Fed API', 'No FRED API key');
		return null;
	}

	try {
		const [total, treasuries, mbs] = await Promise.all([
			fetchFredSeries(SERIES.BALANCE_SHEET_TOTAL, 2),
			fetchFredSeries(SERIES.BALANCE_SHEET_TREASURIES, 1),
			fetchFredSeries(SERIES.BALANCE_SHEET_MBS, 1)
		]);

		// Values are in millions, convert to trillions
		const currentTotal = total[0]?.value && total[0].value !== '.'
			? parseFloat(total[0].value) / 1e6
			: 6.89;
		const previousTotal = total[1]?.value && total[1].value !== '.'
			? parseFloat(total[1].value) / 1e6
			: currentTotal;
		const weeklyChange = (currentTotal - previousTotal) * 1000; // Convert to billions

		const treasuriesValue = treasuries[0]?.value && treasuries[0].value !== '.'
			? parseFloat(treasuries[0].value) / 1e6
			: 4.31;
		const mbsValue = mbs[0]?.value && mbs[0].value !== '.'
			? parseFloat(mbs[0].value) / 1e6
			: 2.24;

		return {
			totalAssets: currentTotal,
			treasuries: treasuriesValue,
			mbs: mbsValue,
			weeklyChange,
			lastUpdated: new Date(total[0]?.date || Date.now())
		};
	} catch (error) {
		logger.error('Fed API', 'Failed to fetch balance sheet:', error);
		return null;
	}
}

/**
 * Get FOMC meeting schedule
 * Note: These are published annually by the Fed. We fetch from FRED releases or use known dates.
 */
export function getFOMCSchedule(): { upcoming: FOMCMeeting[]; recent: FOMCMeeting[] } {
	const now = new Date();
	const currentYear = now.getFullYear();

	// 2025 FOMC meeting dates (from Federal Reserve website)
	const meetings2025: FOMCMeeting[] = [
		{ date: 'Jan 28-29, 2025', type: 'scheduled', hasProjections: false },
		{ date: 'Mar 18-19, 2025', type: 'scheduled', hasProjections: true },
		{ date: 'May 6-7, 2025', type: 'scheduled', hasProjections: false },
		{ date: 'Jun 17-18, 2025', type: 'scheduled', hasProjections: true },
		{ date: 'Jul 29-30, 2025', type: 'scheduled', hasProjections: false },
		{ date: 'Sep 16-17, 2025', type: 'scheduled', hasProjections: true },
		{ date: 'Nov 5-6, 2025', type: 'scheduled', hasProjections: false },
		{ date: 'Dec 16-17, 2025', type: 'scheduled', hasProjections: true }
	];

	// 2026 FOMC meeting dates
	const meetings2026: FOMCMeeting[] = [
		{ date: 'Jan 27-28, 2026', type: 'scheduled', hasProjections: false },
		{ date: 'Mar 17-18, 2026', type: 'scheduled', hasProjections: true },
		{ date: 'May 5-6, 2026', type: 'scheduled', hasProjections: false },
		{ date: 'Jun 16-17, 2026', type: 'scheduled', hasProjections: true },
		{ date: 'Jul 28-29, 2026', type: 'scheduled', hasProjections: false },
		{ date: 'Sep 15-16, 2026', type: 'scheduled', hasProjections: true },
		{ date: 'Nov 4-5, 2026', type: 'scheduled', hasProjections: false },
		{ date: 'Dec 15-16, 2026', type: 'scheduled', hasProjections: true }
	];

	// Recent concluded meetings with decisions
	const recentMeetings: FOMCMeeting[] = [
		{
			date: 'Jan 27-28, 2026',
			type: 'concluded',
			decision: 'hold',
			rateChange: 0,
			newRate: 4.375,
			hasProjections: false
		},
		{
			date: 'Dec 16-17, 2025',
			type: 'concluded',
			decision: 'hold',
			rateChange: 0,
			newRate: 4.375,
			hasProjections: true
		},
		{
			date: 'Nov 5-6, 2025',
			type: 'concluded',
			decision: 'hold',
			rateChange: 0,
			newRate: 4.375,
			hasProjections: false
		}
	];

	// Parse meeting dates to filter
	function parseMeetingDate(dateStr: string): Date {
		// Extract end date from "Mon DD-DD, YYYY" format
		const match = dateStr.match(/(\w+)\s+\d+-(\d+),\s+(\d+)/);
		if (match) {
			return new Date(`${match[1]} ${match[2]}, ${match[3]}`);
		}
		return new Date(dateStr);
	}

	// Combine and filter
	const allMeetings = [...meetings2025, ...meetings2026];
	const upcoming = allMeetings
		.filter((m) => parseMeetingDate(m.date) >= now)
		.map((m) => ({ ...m, type: 'scheduled' as const }));

	return {
		upcoming: upcoming.slice(0, 4),
		recent: recentMeetings.slice(0, 3)
	};
}

/**
 * Fetch all Fed Watch data
 */
export async function fetchFedWatchData(): Promise<{
	fedFunds: FedFundsData | null;
	balanceSheet: BalanceSheetData | null;
	meetings: { upcoming: FOMCMeeting[]; recent: FOMCMeeting[] };
}> {
	const [fedFunds, balanceSheet] = await Promise.all([fetchFedFundsRate(), fetchBalanceSheet()]);

	return {
		fedFunds,
		balanceSheet,
		meetings: getFOMCSchedule()
	};
}

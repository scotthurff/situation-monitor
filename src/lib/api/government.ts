/**
 * Government APIs - USASpending.gov and Congress.gov
 *
 * Fetches federal contract awards and congressional activity.
 * Falls back to mock data if APIs fail.
 */

import { API_URLS, CONGRESS_API_KEY, logger, fetchWithProxy } from '$lib/config';
import { rateLimiters } from '$lib/services';
import type { GovContract, LegislativeBill } from '$lib/types';

/**
 * USASpending API response types
 */
interface USASpendingAward {
	Award_ID: string;
	Recipient_Name: string;
	Award_Amount: number;
	Awarding_Agency: string;
	Description: string;
	Award_Date: string;
	Award_Type: string;
}

interface USASpendingResponse {
	results: USASpendingAward[];
	page_metadata: {
		page: number;
		total: number;
		hasNext: boolean;
	};
}

/**
 * Congress.gov API response types
 */
interface CongressBill {
	number: number;
	title: string;
	originChamber: string;
	originChamberCode: string;
	type: string;
	latestAction: {
		actionDate: string;
		text: string;
	};
	url: string;
	introducedDate: string;
	sponsors: Array<{ name: string }>;
	cosponsors?: { count: number };
	policyArea?: { name: string };
}

interface CongressResponse {
	bills: CongressBill[];
	pagination: {
		count: number;
		next?: string;
	};
}

/**
 * Mock contracts data
 */
const MOCK_CONTRACTS: GovContract[] = [
	{
		id: 'gc-1',
		agency: 'DoD',
		vendor: 'Lockheed Martin',
		value: 2400000000,
		description: 'F-35 sustainment contract',
		awardDate: new Date(),
		type: 'contract'
	},
	{
		id: 'gc-2',
		agency: 'NASA',
		vendor: 'SpaceX',
		value: 843000000,
		description: 'Starship lunar lander development',
		awardDate: new Date(),
		type: 'contract'
	},
	{
		id: 'gc-3',
		agency: 'HHS',
		vendor: 'Moderna',
		value: 590000000,
		description: 'Vaccine manufacturing agreement',
		awardDate: new Date(),
		type: 'contract'
	},
	{
		id: 'gc-4',
		agency: 'DHS',
		vendor: 'Palantir',
		value: 178000000,
		description: 'Border surveillance analytics',
		awardDate: new Date(),
		type: 'contract'
	},
	{
		id: 'gc-5',
		agency: 'GSA',
		vendor: 'Microsoft',
		value: 320000000,
		description: 'Cloud services modernization',
		awardDate: new Date(),
		type: 'modification'
	},
	{
		id: 'gc-6',
		agency: 'DoE',
		vendor: 'Bechtel',
		value: 1200000000,
		description: 'Nuclear facility management',
		awardDate: new Date(),
		type: 'contract'
	}
];

/**
 * Mock bills data
 */
const MOCK_BILLS: LegislativeBill[] = [
	{
		id: 'hr-1',
		number: 'H.R. 25',
		title: 'Fair Tax Act of 2025',
		chamber: 'house',
		status: 'in_committee',
		sponsor: 'Rep. Buddy Carter (R-GA)',
		cosponsors: 45,
		introducedDate: new Date('2025-01-03'),
		lastActionDate: new Date('2025-01-15'),
		lastAction: 'Referred to the House Committee on Ways and Means',
		subjects: ['Taxation', 'National sales tax'],
		link: 'https://congress.gov/bill/119th-congress/house-bill/25'
	},
	{
		id: 's-1',
		number: 'S. 1',
		title: 'Laken Riley Act',
		chamber: 'senate',
		status: 'passed_senate',
		sponsor: 'Sen. Katie Britt (R-AL)',
		cosponsors: 52,
		introducedDate: new Date('2025-01-03'),
		lastActionDate: new Date('2025-01-20'),
		lastAction: 'Passed Senate with amendments',
		subjects: ['Immigration', 'Detention', 'Criminal aliens'],
		link: 'https://congress.gov/bill/119th-congress/senate-bill/1'
	}
];

/**
 * Agency abbreviation mapping
 */
const AGENCY_MAP: Record<string, string> = {
	'Department of Defense': 'DoD',
	'Department of Homeland Security': 'DHS',
	'Department of Health and Human Services': 'HHS',
	'National Aeronautics and Space Administration': 'NASA',
	'General Services Administration': 'GSA',
	'Department of Energy': 'DoE',
	'Department of Veterans Affairs': 'VA',
	'Department of State': 'State',
	'Department of Justice': 'DOJ',
	'Department of the Treasury': 'Treasury',
	'Department of Transportation': 'DOT',
	'Department of Commerce': 'Commerce'
};

/**
 * Get agency abbreviation
 */
function getAgencyAbbrev(fullName: string): string {
	for (const [full, abbrev] of Object.entries(AGENCY_MAP)) {
		if (fullName.toLowerCase().includes(full.toLowerCase())) {
			return abbrev;
		}
	}
	// Return first letters if no match
	return fullName
		.split(' ')
		.filter((w) => w.length > 2)
		.map((w) => w[0])
		.join('')
		.slice(0, 4);
}

/**
 * Determine contract type from award type
 */
function getContractType(awardType: string): 'contract' | 'grant' | 'modification' {
	const type = awardType.toLowerCase();
	if (type.includes('grant')) return 'grant';
	if (type.includes('modification') || type.includes('mod')) return 'modification';
	return 'contract';
}

/**
 * Fetch contracts from USASpending.gov
 */
export async function fetchGovContracts(): Promise<GovContract[]> {
	try {
		await rateLimiters.usaspending.throttle();
		logger.log('Government', 'Fetching contracts from USASpending.gov');

		// USASpending uses POST with a JSON body
		const url = `${API_URLS.usaspending}/search/spending_by_award/`;

		// Get recent significant contracts (>$10M) from last 7 days
		const body = {
			filters: {
				award_type_codes: ['A', 'B', 'C', 'D'], // Contract types
				time_period: [
					{
						start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
						end_date: new Date().toISOString().split('T')[0]
					}
				],
				award_amounts: [
					{
						lower_bound: 10000000 // >$10M for more results
					}
				]
			},
			fields: [
				'Award ID',
				'generated_internal_id',
				'Recipient Name',
				'Award Amount',
				'Awarding Agency',
				'Description',
				'Start Date',
				'Award Type'
			],
			page: 1,
			limit: 15,
			sort: 'Award Amount',
			order: 'desc'
		};

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		const awards = data.results || [];

		if (awards.length === 0) {
			logger.warn('Government', 'No contracts returned from USASpending, using mock data');
			return MOCK_CONTRACTS;
		}

		// USASpending returns field names as requested, with spaces
		const contracts: GovContract[] = awards.map((award: Record<string, unknown>, index: number) => {
			const internalId = String(award['generated_internal_id'] || '');
			return {
				id: `gc-${index + 1}`,
				agency: getAgencyAbbrev(String(award['Awarding Agency'] || '')),
				vendor: cleanVendorName(String(award['Recipient Name'] || 'Unknown')),
				value: Number(award['Award Amount']) || 0,
				description: cleanDescription(String(award['Description'] || 'Federal contract')),
				awardDate: new Date(String(award['Start Date']) || Date.now()),
				type: getContractType(String(award['Award Type'] || '')),
				link: internalId ? `https://www.usaspending.gov/award/${internalId}` : undefined
			};
		});

		logger.log('Government', `Successfully fetched ${contracts.length} contracts`);
		return contracts;
	} catch (error) {
		logger.error('Government', 'Failed to fetch contracts:', error);
		return MOCK_CONTRACTS;
	}
}

/**
 * Clean vendor name for display
 */
function cleanVendorName(name: string): string {
	// Remove common suffixes and clean up
	return name
		.replace(/\s+(INC\.?|LLC|CORP\.?|CORPORATION|LTD\.?|L\.?L\.?C\.?|CO\.?)$/i, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 40);
}

/**
 * Clean description for display
 */
function cleanDescription(desc: string): string {
	// Truncate and clean up
	return desc
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 100);
}

/**
 * Fetch bills from Congress.gov
 */
export async function fetchCongressBills(): Promise<LegislativeBill[]> {
	if (!CONGRESS_API_KEY) {
		logger.debug('Government', 'No Congress API key, using mock data');
		return MOCK_BILLS;
	}

	try {
		await rateLimiters.congress.throttle();
		logger.log('Government', 'Fetching bills from Congress.gov');

		// Get recent bills
		const url = `${API_URLS.congress}/bill?api_key=${CONGRESS_API_KEY}&limit=15&sort=updateDate%20desc&format=json`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: CongressResponse = await response.json();
		const bills = data.bills || [];

		if (bills.length === 0) {
			logger.warn('Government', 'No bills returned from Congress.gov, using mock data');
			return MOCK_BILLS;
		}

		const legislativeBills: LegislativeBill[] = bills.map((bill, index) => ({
			id: `bill-${index + 1}`,
			number: `${bill.type}. ${bill.number}`,
			title: bill.title,
			chamber: bill.originChamberCode === 'H' ? 'house' : 'senate',
			status: 'in_committee', // Would need additional API call to get full status
			sponsor: bill.sponsors?.[0]?.name || 'Unknown',
			cosponsors: bill.cosponsors?.count || 0,
			introducedDate: new Date(bill.introducedDate),
			lastActionDate: new Date(bill.latestAction?.actionDate || bill.introducedDate),
			lastAction: bill.latestAction?.text || 'Introduced',
			subjects: bill.policyArea ? [bill.policyArea.name] : [],
			link: bill.url
		}));

		logger.log('Government', `Successfully fetched ${legislativeBills.length} bills`);
		return legislativeBills;
	} catch (error) {
		logger.error('Government', 'Failed to fetch bills:', error);
		return MOCK_BILLS;
	}
}

/**
 * Get mock contracts (for testing)
 */
export function getMockContracts(): GovContract[] {
	return MOCK_CONTRACTS;
}

/**
 * Get mock bills (for testing)
 */
export function getMockBills(): LegislativeBill[] {
	return MOCK_BILLS;
}

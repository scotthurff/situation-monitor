/**
 * Layoffs API - Parse news for layoff announcements
 *
 * Parses Google News RSS and other sources for layoff announcements.
 * Extracts company names, counts, and sectors from headlines.
 */

import { logger, fetchWithProxy } from '$lib/config';
import type { Layoff } from '$lib/types';

/**
 * Mock layoffs data for fallback
 */
const MOCK_LAYOFFS: Layoff[] = [
	{
		id: 'lo-1',
		company: 'Intel',
		count: 15000,
		location: 'Global',
		sector: 'Semiconductors',
		date: new Date(),
		source: 'Company announcement'
	},
	{
		id: 'lo-2',
		company: 'Chevron',
		count: 8000,
		location: 'Houston, TX',
		sector: 'Energy',
		date: new Date(),
		source: 'SEC filing'
	},
	{
		id: 'lo-3',
		company: 'CNN',
		count: 500,
		location: 'Atlanta, GA',
		sector: 'Media',
		date: new Date(),
		source: 'News report'
	},
	{
		id: 'lo-4',
		company: 'Salesforce',
		count: 2000,
		location: 'San Francisco',
		sector: 'Software',
		date: new Date(),
		source: 'Company announcement'
	},
	{
		id: 'lo-5',
		company: 'Nike',
		count: 1600,
		location: 'Global',
		sector: 'Retail',
		date: new Date(),
		source: 'SEC filing'
	},
	{
		id: 'lo-6',
		company: 'FedEx',
		count: 3500,
		location: 'Memphis, TN',
		sector: 'Logistics',
		date: new Date(),
		source: 'Company announcement'
	},
	{
		id: 'lo-7',
		company: 'Match Group',
		count: 800,
		location: 'Dallas, TX',
		sector: 'Tech',
		date: new Date(),
		source: 'News report'
	}
];

/**
 * Sector keywords for classification
 */
const SECTOR_KEYWORDS: Record<string, string[]> = {
	Tech: ['tech', 'software', 'app', 'digital', 'saas', 'cloud', 'data', 'ai', 'startup'],
	'Semiconductors': ['chip', 'semiconductor', 'intel', 'amd', 'nvidia', 'qualcomm', 'fabrication'],
	Finance: ['bank', 'finance', 'investment', 'trading', 'fintech', 'insurance', 'asset'],
	Retail: ['retail', 'store', 'shop', 'ecommerce', 'consumer', 'brand', 'merchandise'],
	Media: ['media', 'news', 'entertainment', 'streaming', 'broadcast', 'publishing', 'content'],
	Healthcare: ['health', 'medical', 'pharma', 'biotech', 'hospital', 'drug', 'therapeutic'],
	Energy: ['oil', 'gas', 'energy', 'solar', 'wind', 'utility', 'petroleum', 'refinery'],
	Automotive: ['auto', 'car', 'vehicle', 'ev', 'electric vehicle', 'motor', 'automotive'],
	Logistics: ['shipping', 'logistics', 'delivery', 'freight', 'warehouse', 'supply chain'],
	Manufacturing: ['manufacturing', 'factory', 'industrial', 'production', 'assembly']
};

/**
 * Company to sector mapping for known companies
 */
const COMPANY_SECTORS: Record<string, string> = {
	intel: 'Semiconductors',
	amd: 'Semiconductors',
	nvidia: 'Semiconductors',
	google: 'Tech',
	meta: 'Tech',
	facebook: 'Tech',
	microsoft: 'Tech',
	amazon: 'Tech',
	apple: 'Tech',
	salesforce: 'Software',
	oracle: 'Software',
	cnn: 'Media',
	disney: 'Media',
	netflix: 'Media',
	spotify: 'Media',
	tesla: 'Automotive',
	ford: 'Automotive',
	gm: 'Automotive',
	jpmorgan: 'Finance',
	goldman: 'Finance',
	'wells fargo': 'Finance',
	fedex: 'Logistics',
	ups: 'Logistics',
	nike: 'Retail',
	walmart: 'Retail',
	target: 'Retail',
	chevron: 'Energy',
	exxon: 'Energy',
	shell: 'Energy'
};

/**
 * Extract layoff count from headline
 */
function extractLayoffCount(text: string): number | null {
	// Match patterns like "1,000 jobs", "15000 employees", "1.5k workers"
	const patterns = [
		/(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:thousand|k)?\s*(?:jobs?|employees?|workers?|staff|people|positions?|roles?)/i,
		/(?:cut|cutting|slash|slashing|eliminate|eliminating|axe|axing|lay\s*off|laying\s*off)\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:thousand|k)?/i,
		/(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:thousand|k)?\s*(?:cut|layoff|laid\s*off|reduction)/i,
		/(\d+(?:\.\d+)?)\s*%\s*(?:of\s*)?(?:workforce|staff|employees)/i
	];

	for (const pattern of patterns) {
		const match = text.match(pattern);
		if (match) {
			let num = match[1].replace(/,/g, '');
			let value = parseFloat(num);

			// Handle "k" or "thousand"
			if (text.toLowerCase().includes('thousand') || text.toLowerCase().includes('k ')) {
				value *= 1000;
			}

			// Handle percentage (estimate based on typical company sizes)
			if (match[0].includes('%')) {
				// Can't determine exact count from percentage without knowing company size
				return null;
			}

			if (value >= 50 && value <= 100000) {
				return Math.round(value);
			}
		}
	}

	return null;
}

/**
 * Extract company name from headline
 */
function extractCompany(text: string): string | null {
	// Remove common words and find potential company names
	const cleanText = text
		.replace(/layoff|layoffs|job cuts|cutting jobs|to cut|will cut|plans to|announces/gi, '')
		.trim();

	// Look for company names at the start of the headline
	const match = cleanText.match(/^([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)?)/);
	if (match) {
		return match[1];
	}

	return null;
}

/**
 * Determine sector from company name or text
 */
function determineSector(company: string, text: string): string {
	const lowerCompany = company.toLowerCase();
	const lowerText = text.toLowerCase();

	// Check known company mapping first
	for (const [knownCompany, sector] of Object.entries(COMPANY_SECTORS)) {
		if (lowerCompany.includes(knownCompany)) {
			return sector;
		}
	}

	// Check sector keywords in text
	for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
		for (const keyword of keywords) {
			if (lowerText.includes(keyword)) {
				return sector;
			}
		}
	}

	return 'Other';
}

/**
 * Parse RSS feed for layoff news
 */
async function parseLayoffRSS(): Promise<Layoff[]> {
	try {
		// Google News RSS for layoff-related news
		const rssUrl = 'https://news.google.com/rss/search?q=layoffs+OR+"job+cuts"+OR+"workforce+reduction"&hl=en-US&gl=US&ceid=US:en';

		const response = await fetchWithProxy(rssUrl);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const text = await response.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, 'text/xml');

		const items = doc.querySelectorAll('item');
		const layoffs: Layoff[] = [];

		let id = 1;
		items.forEach((item) => {
			const title = item.querySelector('title')?.textContent || '';
			const pubDate = item.querySelector('pubDate')?.textContent;
			const source = item.querySelector('source')?.textContent || 'News';

			// Extract company and count
			const company = extractCompany(title);
			const count = extractLayoffCount(title);

			// Only include if we found both company and count
			if (company && count) {
				layoffs.push({
					id: `lo-${id++}`,
					company,
					count,
					sector: determineSector(company, title),
					date: pubDate ? new Date(pubDate) : new Date(),
					source
				});
			}
		});

		return layoffs;
	} catch (error) {
		logger.warn('Layoffs', 'Failed to parse RSS:', error);
		return [];
	}
}

/**
 * Fetch layoff data from news sources
 */
export async function fetchLayoffs(): Promise<Layoff[]> {
	try {
		logger.log('Layoffs', 'Fetching layoff news from RSS');

		const layoffs = await parseLayoffRSS();

		if (layoffs.length >= 3) {
			logger.log('Layoffs', `Successfully parsed ${layoffs.length} layoff announcements`);
			return layoffs.sort((a, b) => b.count - a.count).slice(0, 15);
		}

		// Fall back to mock data if we didn't find enough
		logger.warn('Layoffs', 'Not enough layoff data from RSS, using mock data');
		return MOCK_LAYOFFS;
	} catch (error) {
		logger.error('Layoffs', 'Failed to fetch layoffs:', error);
		return MOCK_LAYOFFS;
	}
}

/**
 * Get mock layoffs (for testing)
 */
export function getMockLayoffs(): Layoff[] {
	return MOCK_LAYOFFS.sort((a, b) => b.count - a.count);
}

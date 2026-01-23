/**
 * Layoffs API - Aggregate layoff news from multiple RSS sources
 *
 * Uses Google News RSS with multiple search queries to capture
 * layoff announcements. Extracts company names, counts, and sectors.
 */

import { logger, fetchWithProxy } from '$lib/config';
import type { Layoff } from '$lib/types';

/**
 * RSS search queries for layoff news
 */
const LAYOFF_QUERIES = [
	'tech layoffs 2025',
	'"job cuts" company',
	'"workforce reduction"',
	'layoffs announced',
	'"laying off" employees'
];

/**
 * Sector keywords for classification
 */
const SECTOR_KEYWORDS: Record<string, string[]> = {
	Tech: ['tech', 'software', 'app', 'digital', 'saas', 'cloud', 'ai', 'startup', 'meta', 'google', 'microsoft', 'amazon'],
	Finance: ['bank', 'finance', 'investment', 'trading', 'fintech', 'insurance', 'goldman', 'jpmorgan', 'citi'],
	Retail: ['retail', 'store', 'walmart', 'target', 'nike', 'amazon', 'ecommerce'],
	Media: ['media', 'news', 'entertainment', 'streaming', 'disney', 'netflix', 'cnn', 'paramount'],
	Healthcare: ['health', 'medical', 'pharma', 'biotech', 'hospital', 'pfizer', 'johnson'],
	Automotive: ['auto', 'car', 'tesla', 'ford', 'gm', 'rivian', 'ev'],
	Semiconductors: ['chip', 'semiconductor', 'intel', 'amd', 'nvidia', 'qualcomm', 'tsmc'],
	Energy: ['oil', 'gas', 'energy', 'solar', 'chevron', 'exxon', 'shell'],
	Logistics: ['shipping', 'logistics', 'fedex', 'ups', 'delivery'],
	Telecom: ['telecom', 'verizon', 'at&t', 't-mobile', '5g']
};

/**
 * Known company patterns for better extraction
 */
const KNOWN_COMPANIES = [
	'Meta', 'Google', 'Microsoft', 'Amazon', 'Apple', 'Tesla', 'Intel', 'IBM',
	'Salesforce', 'Oracle', 'Cisco', 'Dell', 'HP', 'Adobe', 'Netflix', 'Spotify',
	'Uber', 'Lyft', 'Airbnb', 'DoorDash', 'Snap', 'Twitter', 'X Corp', 'PayPal',
	'Block', 'Square', 'Stripe', 'Coinbase', 'Robinhood', 'Zoom', 'Slack',
	'Disney', 'Warner Bros', 'Paramount', 'CNN', 'Fox', 'NBC', 'CBS',
	'Goldman Sachs', 'Morgan Stanley', 'JPMorgan', 'Citigroup', 'Bank of America',
	'Ford', 'GM', 'Rivian', 'Lucid', 'Boeing', 'Lockheed', 'Raytheon',
	'Pfizer', 'Moderna', 'Johnson & Johnson', 'CVS', 'Walgreens',
	'Walmart', 'Target', 'Best Buy', 'Nike', 'Adidas', 'Gap',
	'FedEx', 'UPS', 'DHL', 'Chevron', 'Exxon', 'Shell', 'BP',
	'Verizon', 'AT&T', 'T-Mobile', 'Comcast', 'Charter'
];

/**
 * Extract layoff count from text
 */
function extractLayoffCount(text: string): number | null {
	const lowerText = text.toLowerCase();

	// Patterns for extracting numbers
	const patterns = [
		// "1,000 jobs" or "1000 employees"
		/(\d{1,3}(?:,\d{3})*)\s*(?:jobs?|employees?|workers?|staff|people|positions?|roles?)/i,
		// "cuts 1,000" or "laying off 500"
		/(?:cut(?:ting)?|lay(?:ing)?\s*off|eliminat(?:e|ing)|slash(?:ing)?|ax(?:e|ing)?)\s*(\d{1,3}(?:,\d{3})*)/i,
		// "1,000 layoffs"
		/(\d{1,3}(?:,\d{3})*)\s*layoffs?/i,
		// "about 1,000" or "nearly 500"
		/(?:about|nearly|around|approximately|up to)\s*(\d{1,3}(?:,\d{3})*)/i
	];

	for (const pattern of patterns) {
		const match = text.match(pattern);
		if (match) {
			const numStr = match[1].replace(/,/g, '');
			const value = parseInt(numStr, 10);

			// Sanity check: reasonable layoff numbers
			if (value >= 50 && value <= 50000) {
				return value;
			}
		}
	}

	// Check for "X%" patterns and estimate
	const percentMatch = text.match(/(\d+)\s*%\s*(?:of\s*)?(?:workforce|staff|employees)/i);
	if (percentMatch) {
		// Can't determine exact count without company size
		return null;
	}

	return null;
}

/**
 * Extract company name from headline
 */
function extractCompany(text: string): string | null {
	// Check for known companies first
	for (const company of KNOWN_COMPANIES) {
		if (text.toLowerCase().includes(company.toLowerCase())) {
			return company;
		}
	}

	// Try to extract from headline structure
	// Pattern: "Company to lay off..." or "Company announces..."
	const patterns = [
		/^([A-Z][a-zA-Z0-9&\s]{2,20}?)(?:\s+to\s+(?:lay|cut)|announces|plans|will)/i,
		/^([A-Z][a-zA-Z0-9&\s]{2,20}?)\s+(?:layoffs|job cuts|cutting)/i
	];

	for (const pattern of patterns) {
		const match = text.match(pattern);
		if (match) {
			const name = match[1].trim();
			// Filter out common words that aren't company names
			if (!['The', 'More', 'Why', 'How', 'What', 'Report', 'Breaking'].includes(name)) {
				return name;
			}
		}
	}

	return null;
}

/**
 * Determine sector from company name and text
 */
function determineSector(company: string, text: string): string {
	const combined = `${company} ${text}`.toLowerCase();

	for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
		for (const keyword of keywords) {
			if (combined.includes(keyword.toLowerCase())) {
				return sector;
			}
		}
	}

	return 'Other';
}

/**
 * Parse a single RSS feed
 */
async function parseRSS(query: string): Promise<Layoff[]> {
	try {
		const encodedQuery = encodeURIComponent(query);
		const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

		const response = await fetchWithProxy(rssUrl);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const text = await response.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, 'text/xml');

		const items = doc.querySelectorAll('item');
		const layoffs: Layoff[] = [];

		items.forEach((item, index) => {
			const title = item.querySelector('title')?.textContent || '';
			const pubDate = item.querySelector('pubDate')?.textContent;
			const source = item.querySelector('source')?.textContent || 'News';
			const link = item.querySelector('link')?.textContent || '';

			const company = extractCompany(title);
			const count = extractLayoffCount(title);

			// Only include if we found both company and count
			if (company && count) {
				layoffs.push({
					id: `lo-${Date.now()}-${index}`,
					company,
					count,
					sector: determineSector(company, title),
					date: pubDate ? new Date(pubDate) : new Date(),
					source,
					link
				});
			}
		});

		return layoffs;
	} catch (error) {
		logger.warn('Layoffs', `Failed to parse RSS for "${query}":`, error);
		return [];
	}
}

/**
 * Deduplicate layoffs by company (keep highest count)
 */
function deduplicateLayoffs(layoffs: Layoff[]): Layoff[] {
	const byCompany = new Map<string, Layoff>();

	for (const layoff of layoffs) {
		const key = layoff.company.toLowerCase();
		const existing = byCompany.get(key);

		if (!existing || layoff.count > existing.count) {
			byCompany.set(key, layoff);
		}
	}

	return Array.from(byCompany.values());
}

/**
 * Fetch layoff data from multiple RSS sources
 */
export async function fetchLayoffs(): Promise<Layoff[]> {
	try {
		logger.log('Layoffs', 'Fetching layoff news from multiple RSS sources');

		// Fetch from all queries in parallel
		const results = await Promise.all(
			LAYOFF_QUERIES.map(query => parseRSS(query))
		);

		// Flatten and deduplicate
		const allLayoffs = results.flat();
		const uniqueLayoffs = deduplicateLayoffs(allLayoffs);

		// Sort by count (largest first) and limit
		const sorted = uniqueLayoffs
			.sort((a, b) => b.count - a.count)
			.slice(0, 15);

		if (sorted.length > 0) {
			logger.log('Layoffs', `Found ${sorted.length} unique layoff announcements`);
			return sorted;
		}

		logger.warn('Layoffs', 'No layoffs found from RSS sources');
		return [];
	} catch (error) {
		logger.error('Layoffs', 'Failed to fetch layoffs:', error);
		return [];
	}
}

/**
 * Get mock layoffs (for testing)
 */
export function getMockLayoffs(): Layoff[] {
	return [];
}

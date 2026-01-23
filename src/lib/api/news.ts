/**
 * News API - Fetches and parses RSS feeds
 */

import { browser } from '$app/environment';
import { newsClient } from '$lib/services';
import { FEEDS, INTEL_SOURCES, fetchWithProxy, CACHE_TTLS, logger } from '$lib/config';
import { detectAlertLevel, detectRegions, detectSentiment } from '$lib/config/keywords';
import type { NewsItem, NewsCategory } from '$lib/types';

/**
 * Get DOMParser that works in both browser and server
 */
async function getDOMParser(): Promise<typeof DOMParser> {
	if (browser) {
		return DOMParser;
	}
	// Server-side: use @xmldom/xmldom
	const { DOMParser: XMLDOMParser } = await import('@xmldom/xmldom');
	return XMLDOMParser as unknown as typeof DOMParser;
}

/**
 * Parse RSS XML into news items
 */
async function parseRSS(xml: string, source: string, category: NewsCategory): Promise<NewsItem[]> {
	const items: NewsItem[] = [];

	try {
		const DOMParserClass = await getDOMParser();
		const parser = new DOMParserClass();
		const doc = parser.parseFromString(xml, 'text/xml');

		// Check for parse errors
		const parseError = doc.querySelector('parsererror');
		if (parseError) {
			logger.warn('News', `Parse error for ${source}`);
			return [];
		}

		// Handle both RSS and Atom formats
		const entries = doc.querySelectorAll('item, entry');

		entries.forEach((entry, index) => {
			try {
				const title =
					entry.querySelector('title')?.textContent?.trim() || '';
				const link =
					entry.querySelector('link')?.textContent?.trim() ||
					entry.querySelector('link')?.getAttribute('href') ||
					'';
				const pubDateStr =
					entry.querySelector('pubDate, published, updated')?.textContent?.trim() || '';
				const description =
					entry.querySelector('description, summary, content')?.textContent?.trim() || '';

				if (!title) return;

				const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();
				const fullText = `${title} ${description}`;

				items.push({
					id: `${source}-${index}-${Date.now()}`,
					title,
					link,
					source,
					category,
					pubDate,
					description: description.slice(0, 300),
					severity: detectAlertLevel(fullText) || undefined,
					regions: detectRegions(fullText),
					sentiment: detectSentiment(fullText)
				});
			} catch (err) {
				// Skip malformed entries
			}
		});
	} catch (err) {
		logger.error('News', `Failed to parse RSS for ${source}:`, err);
	}

	return items;
}

/**
 * Fetch news from a single feed
 */
async function fetchFeed(
	url: string,
	source: string,
	category: NewsCategory
): Promise<NewsItem[]> {
	try {
		const response = await fetchWithProxy(url);
		const xml = await response.text();
		return await parseRSS(xml, source, category);
	} catch (err) {
		logger.warn('News', `Failed to fetch ${source}:`, err);
		return [];
	}
}

/**
 * Fetch news from all feeds in a category
 */
export async function fetchCategoryNews(category: NewsCategory): Promise<NewsItem[]> {
	const feeds = FEEDS[category] || [];
	const allItems: NewsItem[] = [];

	// Fetch feeds in parallel, but limit concurrency
	const results = await Promise.allSettled(
		feeds.map((feed) => fetchFeed(feed.url, feed.name, category))
	);

	results.forEach((result) => {
		if (result.status === 'fulfilled') {
			allItems.push(...result.value);
		}
	});

	// Sort by date, newest first
	allItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

	// Deduplicate by title similarity
	const seen = new Set<string>();
	const unique = allItems.filter((item) => {
		const key = item.title.toLowerCase().slice(0, 50);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});

	return unique;
}

/**
 * Fetch all news across all categories
 */
export async function fetchAllNews(): Promise<Map<NewsCategory, NewsItem[]>> {
	const categories: NewsCategory[] = [
		'politics',
		'uspolitics',
		'legal',
		'immigration',
		'tech',
		'finance',
		'gov',
		'ai',
		'intel',
		'macro'
	];
	const results = new Map<NewsCategory, NewsItem[]>();

	// Fetch categories in parallel
	await Promise.all(
		categories.map(async (category) => {
			const items = await fetchCategoryNews(category);
			results.set(category, items);
		})
	);

	return results;
}

/**
 * Fetch intel sources
 */
export async function fetchIntelNews(): Promise<NewsItem[]> {
	const allItems: NewsItem[] = [];

	const results = await Promise.allSettled(
		INTEL_SOURCES.map((source) => fetchFeed(source.url, source.name, 'intel'))
	);

	results.forEach((result) => {
		if (result.status === 'fulfilled') {
			allItems.push(...result.value);
		}
	});

	// Sort and deduplicate
	allItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

	const seen = new Set<string>();
	return allItems.filter((item) => {
		const key = item.title.toLowerCase().slice(0, 50);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

/**
 * Get combined news feed (all categories merged)
 */
export async function fetchCombinedNews(limit = 100): Promise<NewsItem[]> {
	const allNews = await fetchAllNews();
	const combined: NewsItem[] = [];

	for (const items of allNews.values()) {
		combined.push(...items);
	}

	// Sort by date
	combined.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

	// Deduplicate
	const seen = new Set<string>();
	const unique = combined.filter((item) => {
		const key = item.title.toLowerCase().slice(0, 50);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});

	return unique.slice(0, limit);
}

/**
 * Get breaking/alert news only
 */
export async function fetchAlertNews(): Promise<NewsItem[]> {
	const combined = await fetchCombinedNews(200);
	return combined.filter((item) => item.severity);
}

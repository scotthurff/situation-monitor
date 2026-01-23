/**
 * News store - Manages news data with Svelte 5 runes
 * Implements cache-first loading for instant perceived performance
 */

import { fetchCombinedNews, fetchCategoryNews, fetchIntelNews } from '$lib/api';
import { newsCache, intelCache } from '$lib/services/cache';
import type { NewsItem, NewsCategory } from '$lib/types';

// Cache keys
const NEWS_CACHE_KEY = 'news:combined';
const INTEL_CACHE_KEY = 'news:intel';

// Reactive state using Svelte 5 runes
let news = $state<NewsItem[]>([]);
let intelNews = $state<NewsItem[]>([]);
let isLoading = $state(false);
let error = $state<string | null>(null);
let lastUpdated = $state<Date | null>(null);

// Derived values
const alertNews = $derived(news.filter((item) => item.severity));
const newsCount = $derived(news.length);

/**
 * Load news from cache (instant, non-blocking)
 */
function loadFromCache(): boolean {
	const cached = newsCache.getStale<NewsItem[]>(NEWS_CACHE_KEY);
	if (cached && cached.length > 0) {
		news = cached;
		return true;
	}
	return false;
}

/**
 * Load intel from cache
 */
function loadIntelFromCache(): boolean {
	const cached = intelCache.getStale<NewsItem[]>(INTEL_CACHE_KEY);
	if (cached && cached.length > 0) {
		intelNews = cached;
		return true;
	}
	return false;
}

/**
 * Fetch all news (cache-first: shows cached data instantly, fetches fresh in background)
 */
async function fetchNews(limit = 100): Promise<void> {
	// Show cached data immediately
	const hadCache = loadFromCache();

	// Only show loading state if no cached data
	isLoading = !hadCache;
	error = null;

	try {
		const fresh = await fetchCombinedNews(limit);
		newsCache.set(NEWS_CACHE_KEY, fresh);
		news = fresh;
		lastUpdated = new Date();
	} catch (err) {
		// Only show error if we had no cached data to fall back on
		if (!hadCache) {
			error = err instanceof Error ? err.message : 'Failed to fetch news';
			console.error('[NewsStore]', error);
		}
	} finally {
		isLoading = false;
	}
}

/**
 * Fetch intel news (cache-first)
 */
async function fetchIntel(): Promise<void> {
	// Show cached data immediately
	loadIntelFromCache();

	try {
		const fresh = await fetchIntelNews();
		intelCache.set(INTEL_CACHE_KEY, fresh);
		intelNews = fresh;
	} catch (err) {
		console.error('[NewsStore] Failed to fetch intel:', err);
	}
}

/**
 * Hydrate store with server-side data (for SSR)
 */
function hydrate(items: NewsItem[]): void {
	if (items.length > 0 && news.length === 0) {
		news = items;
		newsCache.set(NEWS_CACHE_KEY, items);
		lastUpdated = new Date();
	}
}

/**
 * Get news by category
 */
function getByCategory(category: NewsCategory): NewsItem[] {
	return news.filter((item) => item.category === category);
}

/**
 * Get news by region
 */
function getByRegion(region: string): NewsItem[] {
	return news.filter((item) => item.regions?.includes(region));
}

/**
 * Search news by keyword
 */
function search(query: string): NewsItem[] {
	const lower = query.toLowerCase();
	return news.filter(
		(item) =>
			item.title.toLowerCase().includes(lower) ||
			item.description?.toLowerCase().includes(lower)
	);
}

/**
 * Clear all news
 */
function clear(): void {
	news = [];
	intelNews = [];
	error = null;
}

// Export store interface
export const newsStore = {
	get news() {
		return news;
	},
	get intelNews() {
		return intelNews;
	},
	get alertNews() {
		return alertNews;
	},
	get isLoading() {
		return isLoading;
	},
	get error() {
		return error;
	},
	get lastUpdated() {
		return lastUpdated;
	},
	get count() {
		return newsCount;
	},
	fetchNews,
	fetchIntel,
	getByCategory,
	getByRegion,
	search,
	clear,
	hydrate,
	loadFromCache
};

/**
 * News store - Manages news data with Svelte 5 runes
 */

import { fetchCombinedNews, fetchCategoryNews, fetchIntelNews } from '$lib/api';
import type { NewsItem, NewsCategory } from '$lib/types';

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
 * Fetch all news
 */
async function fetchNews(limit = 100): Promise<void> {
	isLoading = true;
	error = null;

	try {
		news = await fetchCombinedNews(limit);
		lastUpdated = new Date();
	} catch (err) {
		error = err instanceof Error ? err.message : 'Failed to fetch news';
		console.error('[NewsStore]', error);
	} finally {
		isLoading = false;
	}
}

/**
 * Fetch intel news specifically
 */
async function fetchIntel(): Promise<void> {
	try {
		intelNews = await fetchIntelNews();
	} catch (err) {
		console.error('[NewsStore] Failed to fetch intel:', err);
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
	clear
};

/**
 * Server-side data loading for SSR
 * Only fetches fast APIs - slow RSS feeds load client-side
 * This keeps initial page load fast while still providing some data
 */

import { fetchIndices } from '$lib/api/markets';
import type { PageServerLoad } from './$types';

// Set a timeout for SSR data fetching to prevent slow page loads
const SSR_TIMEOUT = 3000; // 3 seconds max

async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
	const timeout = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms));
	return Promise.race([promise, timeout]);
}

export const load: PageServerLoad = async () => {
	// Only fetch fast market data server-side
	// News/RSS feeds are slow and load client-side with cache-first strategy
	const indicesResult = await withTimeout(
		fetchIndices().catch(() => []),
		SSR_TIMEOUT,
		[]
	);

	return {
		initialNews: [], // Let client handle news with cache-first
		initialIndices: indicesResult,
		timestamp: Date.now()
	};
};

/**
 * Server-side data loading for SSR
 * Pre-fetches critical data so page arrives with content already rendered
 */

import { fetchCombinedNews } from '$lib/api';
import { fetchIndices } from '$lib/api/markets';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Fetch critical data server-side in parallel
	// Using Promise.allSettled so one failure doesn't block others
	const [newsResult, indicesResult] = await Promise.allSettled([
		fetchCombinedNews(50).catch(() => []),
		fetchIndices().catch(() => [])
	]);

	return {
		initialNews: newsResult.status === 'fulfilled' ? newsResult.value : [],
		initialIndices: indicesResult.status === 'fulfilled' ? indicesResult.value : [],
		timestamp: Date.now()
	};
};

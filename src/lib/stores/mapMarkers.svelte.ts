/**
 * Dynamic Map Markers Store
 *
 * Manages dynamic markers derived from news items by extracting
 * geographic locations and aggregating by location.
 */

import type { DynamicMarker, NewsItem } from '$lib/types';
import { aggregateByLocation, filterRecentActivity } from '$lib/analysis/location';
import { generateId } from '$lib/utils';

// Reactive state
let markers = $state<DynamicMarker[]>([]);
let lastRefresh = $state<Date | null>(null);
let isProcessing = $state(false);

// Configuration
const MAX_AGE_HOURS = 24; // Only show markers for news within 24h
const MIN_COUNT = 1; // Minimum mentions to show marker
const MAX_ITEMS_TO_PROCESS = 200; // Limit items to process for performance

/**
 * Process news items and extract dynamic markers
 */
function processNews(items: NewsItem[]): void {
	if (isProcessing) return;
	isProcessing = true;

	try {
		// Limit items to process for performance
		const limitedItems = items.slice(0, MAX_ITEMS_TO_PROCESS);

		// Aggregate news by location
		const aggregates = aggregateByLocation(limitedItems);

		// Filter to recent activity only
		const recentAggregates = filterRecentActivity(aggregates, MAX_AGE_HOURS);

		// Convert to DynamicMarker format
		markers = recentAggregates
			.filter((agg) => agg.count >= MIN_COUNT)
			.map((agg) => ({
				id: generateId(),
				name: agg.location.name,
				lat: agg.location.lat,
				lon: agg.location.lon,
				type: 'news' as const,
				severity: agg.severity,
				count: agg.count,
				lastSeen: agg.lastSeen,
				items: agg.items
			}));

		lastRefresh = new Date();
	} catch (err) {
		console.error('[MapMarkers] Failed to process news:', err);
	} finally {
		isProcessing = false;
	}
}

/**
 * Manually refresh markers from provided news items
 */
function refresh(newsItems: NewsItem[]): void {
	processNews(newsItems);
}

/**
 * Clear all markers
 */
function clear(): void {
	markers = [];
	lastRefresh = null;
}

/**
 * Get markers filtered by severity
 */
function getBySeverity(
	severity: 'low' | 'medium' | 'high' | 'critical'
): DynamicMarker[] {
	return markers.filter((m) => m.severity === severity);
}

/**
 * Get markers for a specific region
 * (Would need to add region to DynamicMarker for full support)
 */
function getHighPriority(): DynamicMarker[] {
	return markers.filter((m) => m.severity === 'high' || m.severity === 'critical');
}

// Export store interface
export const mapMarkerStore = {
	get markers() {
		return markers;
	},
	get lastRefresh() {
		return lastRefresh;
	},
	get isProcessing() {
		return isProcessing;
	},
	get markerCount() {
		return markers.length;
	},
	refresh,
	clear,
	getBySeverity,
	getHighPriority
};

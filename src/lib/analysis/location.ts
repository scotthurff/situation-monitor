/**
 * Location extraction utilities for news items
 *
 * Extracts geographic locations from news text and aggregates by location
 */

import type { NewsItem } from '$lib/types';
import { LOCATIONS, LOCATION_LOOKUP, type GeoLocation } from '$lib/config/locations';

export interface LocationMatch {
	location: GeoLocation;
	matchedAlias: string;
}

export interface LocationAggregate {
	location: GeoLocation;
	count: number;
	items: NewsItem[];
	lastSeen: Date;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Pre-compiled location patterns for performance
 * Only compile once at module load, not on every extraction
 */
interface CompiledLocation {
	location: GeoLocation;
	lowerName: string;
	patterns: { alias: string; regex: RegExp | null }[];
}

const COMPILED_LOCATIONS: CompiledLocation[] = LOCATIONS.map((loc) => ({
	location: loc,
	lowerName: loc.name.toLowerCase(),
	patterns: loc.aliases.map((alias) => ({
		alias,
		// Pre-compile regex for short aliases, null for longer ones (use includes)
		regex: alias.length <= 3 ? new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i') : null
	}))
}));

/**
 * Extract all mentioned locations from text
 * Returns unique locations (deduped by name)
 * Uses pre-compiled patterns for performance
 */
export function extractLocations(text: string): GeoLocation[] {
	const lowerText = text.toLowerCase();
	const found = new Map<string, GeoLocation>();

	// Check each location's aliases against the text
	for (const compiled of COMPILED_LOCATIONS) {
		// Check primary name first
		if (lowerText.includes(compiled.lowerName)) {
			found.set(compiled.location.name, compiled.location);
			continue;
		}

		// Check aliases using pre-compiled patterns
		for (const pattern of compiled.patterns) {
			if (pattern.regex) {
				// Short alias - use pre-compiled regex
				if (pattern.regex.test(text)) {
					found.set(compiled.location.name, compiled.location);
					break;
				}
			} else {
				// Longer alias - use simple includes
				if (lowerText.includes(pattern.alias)) {
					found.set(compiled.location.name, compiled.location);
					break;
				}
			}
		}
	}

	return Array.from(found.values());
}

/**
 * Extract locations from a news item (title + description)
 */
export function extractLocationsFromItem(item: NewsItem): GeoLocation[] {
	const text = `${item.title} ${item.description || ''}`;
	return extractLocations(text);
}

/**
 * Aggregate news items by location
 * Groups items mentioning the same location and computes severity
 */
export function aggregateByLocation(items: NewsItem[]): LocationAggregate[] {
	const aggregates = new Map<string, LocationAggregate>();

	for (const item of items) {
		const locations = extractLocationsFromItem(item);

		for (const location of locations) {
			const existing = aggregates.get(location.name);

			if (existing) {
				existing.count++;
				existing.items.push(item);
				if (item.pubDate > existing.lastSeen) {
					existing.lastSeen = item.pubDate;
				}
			} else {
				aggregates.set(location.name, {
					location,
					count: 1,
					items: [item],
					lastSeen: item.pubDate,
					severity: 'low'
				});
			}
		}
	}

	// Compute severity based on count and item severity
	for (const agg of aggregates.values()) {
		agg.severity = computeSeverity(agg);
		// Sort items by date (most recent first)
		agg.items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
		// Limit to 10 items per location
		agg.items = agg.items.slice(0, 10);
	}

	// Sort by count (most mentioned first)
	return Array.from(aggregates.values()).sort((a, b) => b.count - a.count);
}

/**
 * Compute severity for a location aggregate
 * Based on mention count and individual item severity
 */
function computeSeverity(agg: LocationAggregate): 'low' | 'medium' | 'high' | 'critical' {
	// Check if any item has high/critical severity
	const hasCritical = agg.items.some((i) => i.severity === 'critical');
	const hasHigh = agg.items.some((i) => i.severity === 'high');

	if (hasCritical || agg.count >= 10) {
		return 'critical';
	}

	if (hasHigh || agg.count >= 5) {
		return 'high';
	}

	if (agg.count >= 3) {
		return 'medium';
	}

	return 'low';
}

/**
 * Filter aggregates to only recent activity (within hours)
 */
export function filterRecentActivity(
	aggregates: LocationAggregate[],
	maxAgeHours: number = 24
): LocationAggregate[] {
	const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

	return aggregates
		.filter((agg) => agg.lastSeen >= cutoff)
		.map((agg) => ({
			...agg,
			items: agg.items.filter((item) => item.pubDate >= cutoff)
		}))
		.filter((agg) => agg.items.length > 0);
}

/**
 * Get location by name (case-insensitive)
 */
export function getLocationByName(name: string): GeoLocation | undefined {
	return LOCATION_LOOKUP.get(name.toLowerCase());
}

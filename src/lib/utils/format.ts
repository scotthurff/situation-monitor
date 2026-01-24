/**
 * Formatting utilities
 */

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSecs < 60) {
		return 'just now';
	}
	if (diffMins < 60) {
		return `${diffMins}m ago`;
	}
	if (diffHours < 24) {
		return `${diffHours}h ago`;
	}
	if (diffDays < 7) {
		return `${diffDays}d ago`;
	}

	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format number with K/M/B suffix
 */
export function formatCompactNumber(num: number): string {
	if (num >= 1e9) {
		return `${(num / 1e9).toFixed(1)}B`;
	}
	if (num >= 1e6) {
		return `${(num / 1e6).toFixed(1)}M`;
	}
	if (num >= 1e3) {
		return `${(num / 1e3).toFixed(1)}K`;
	}
	return num.toFixed(0);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 2): string {
	const sign = value >= 0 ? '+' : '';
	return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format currency
 */
export function formatCurrency(value: number, currency = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - 3) + '...';
}

/**
 * Strip HTML tags from text
 */
export function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Calculate timestamp freshness as a value from 0 to 1
 * 1 = very fresh (just now), 0 = old (24+ hours)
 * Uses a logarithmic decay for natural-feeling progression
 */
export function getTimestampFreshness(date: Date): number {
	const now = new Date();
	const ageMs = now.getTime() - date.getTime();
	const ageHours = ageMs / (1000 * 60 * 60);

	// Freshness ranges:
	// < 15 min: 1.0 (brightest)
	// 15 min - 1 hour: 0.85-1.0
	// 1-6 hours: 0.5-0.85
	// 6-24 hours: 0.2-0.5
	// > 24 hours: 0 (baseline muted)

	if (ageHours < 0.25) return 1.0; // < 15 min
	if (ageHours < 1) return 0.85 + (1 - ageHours) * 0.15; // 15 min - 1 hour
	if (ageHours < 6) return 0.5 + ((6 - ageHours) / 5) * 0.35; // 1-6 hours
	if (ageHours < 24) return 0.2 + ((24 - ageHours) / 18) * 0.3; // 6-24 hours
	return 0; // > 24 hours (use baseline muted color)
}

/**
 * Get the color for a timestamp based on its freshness
 * Fresh items are bright (close to white), older items fade to muted gray
 */
export function getTimestampColor(date: Date): string {
	const freshness = getTimestampFreshness(date);
	// Interpolate between muted gray (#6b7280) and bright white (#ffffff)
	const mutedR = 107,
		mutedG = 114,
		mutedB = 128;
	const brightR = 255,
		brightG = 255,
		brightB = 255;
	const r = Math.round(mutedR + (brightR - mutedR) * freshness);
	const g = Math.round(mutedG + (brightG - mutedG) * freshness);
	const b = Math.round(mutedB + (brightB - mutedB) * freshness);
	return `rgb(${r}, ${g}, ${b})`;
}

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

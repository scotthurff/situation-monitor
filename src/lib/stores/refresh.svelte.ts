/**
 * Refresh store - Orchestrates multi-stage data fetching
 */

import { browser } from '$app/environment';
import { newsStore } from './news.svelte';
import { marketsStore } from './markets.svelte';
import { settingsStore } from './settings.svelte';
import { REFRESH_STAGE_DELAYS } from '$lib/config';
import type { RefreshStage, RefreshState } from '$lib/types';

// Reactive state
let isRefreshing = $state(false);
let currentStage = $state<RefreshStage | null>(null);
let lastRefresh = $state<Date | null>(null);
let errors = $state<string[]>([]);
let refreshInterval = $state<ReturnType<typeof setInterval> | null>(null);

// Derived
const refreshState = $derived<RefreshState>({
	isRefreshing,
	currentStage,
	lastRefresh,
	errors
});

/**
 * Execute critical stage (immediate)
 * - News feeds
 * - Market indices
 */
async function executeCriticalStage(): Promise<void> {
	currentStage = 'critical';
	const stageErrors: string[] = [];

	await Promise.allSettled([
		newsStore.fetchNews(100).catch((e) => {
			stageErrors.push(`News: ${e.message}`);
		}),
		marketsStore.fetchCritical().catch((e) => {
			stageErrors.push(`Markets: ${e.message}`);
		})
	]);

	if (stageErrors.length > 0) {
		errors = [...errors, ...stageErrors];
	}
}

/**
 * Execute secondary stage (delayed)
 * - Crypto
 * - Commodities
 * - Intel
 */
async function executeSecondaryStage(): Promise<void> {
	currentStage = 'secondary';
	const stageErrors: string[] = [];

	await Promise.allSettled([
		marketsStore.fetchSecondary().catch((e) => {
			stageErrors.push(`Secondary markets: ${e.message}`);
		}),
		newsStore.fetchIntel().catch((e) => {
			stageErrors.push(`Intel: ${e.message}`);
		})
	]);

	if (stageErrors.length > 0) {
		errors = [...errors, ...stageErrors];
	}
}

/**
 * Execute tertiary stage (further delayed)
 * - Analysis (correlations, narratives)
 * - Polymarket predictions
 * - Less critical data
 */
async function executeTertiaryStage(): Promise<void> {
	currentStage = 'tertiary';
	const stageErrors: string[] = [];

	await Promise.allSettled([
		marketsStore.fetchPolymarket().catch((e) => {
			stageErrors.push(`Polymarket: ${e.message}`);
		})
	]);

	if (stageErrors.length > 0) {
		errors = [...errors, ...stageErrors];
	}
}

/**
 * Run full multi-stage refresh
 */
async function refresh(): Promise<void> {
	if (isRefreshing) return;

	isRefreshing = true;
	errors = [];

	try {
		// Stage 1: Critical (immediate)
		await executeCriticalStage();

		// Stage 2: Secondary (delayed)
		await new Promise((r) => setTimeout(r, REFRESH_STAGE_DELAYS.secondary));
		await executeSecondaryStage();

		// Stage 3: Tertiary (further delayed)
		await new Promise((r) => setTimeout(r, REFRESH_STAGE_DELAYS.tertiary - REFRESH_STAGE_DELAYS.secondary));
		await executeTertiaryStage();

		lastRefresh = new Date();
	} catch (err) {
		console.error('[Refresh] Failed:', err);
		errors = [...errors, err instanceof Error ? err.message : 'Unknown error'];
	} finally {
		isRefreshing = false;
		currentStage = null;
	}
}

/**
 * Quick refresh - critical data only
 */
async function quickRefresh(): Promise<void> {
	if (isRefreshing) return;

	isRefreshing = true;
	errors = [];

	try {
		await executeCriticalStage();
		lastRefresh = new Date();
	} finally {
		isRefreshing = false;
		currentStage = null;
	}
}

/**
 * Start auto-refresh interval
 */
function startAutoRefresh(): void {
	if (!browser) return;
	stopAutoRefresh();

	const interval = settingsStore.refreshInterval;
	refreshInterval = setInterval(() => {
		refresh();
	}, interval);

	// Run initial refresh
	refresh();
}

/**
 * Stop auto-refresh
 */
function stopAutoRefresh(): void {
	if (refreshInterval) {
		clearInterval(refreshInterval);
		refreshInterval = null;
	}
}

/**
 * Update auto-refresh interval
 */
function setRefreshInterval(ms: number): void {
	settingsStore.update('refreshInterval', ms);
	if (refreshInterval) {
		startAutoRefresh(); // Restart with new interval
	}
}

/**
 * Clear all errors
 */
function clearErrors(): void {
	errors = [];
}

// Export store interface
export const refreshStore = {
	get state() {
		return refreshState;
	},
	get isRefreshing() {
		return isRefreshing;
	},
	get currentStage() {
		return currentStage;
	},
	get lastRefresh() {
		return lastRefresh;
	},
	get errors() {
		return errors;
	},
	refresh,
	quickRefresh,
	startAutoRefresh,
	stopAutoRefresh,
	setRefreshInterval,
	clearErrors
};

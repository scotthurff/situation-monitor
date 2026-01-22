/**
 * Settings store - User preferences with persistence
 */

import { browser } from '$app/environment';
import { PANELS, getDefaultEnabledPanels } from '$lib/config';
import type { AppSettings, PanelConfig, NewsCategory } from '$lib/types';

const STORAGE_KEY = 'situation-monitor-settings';

// Default settings
const defaultSettings: AppSettings = {
	theme: 'dark',
	refreshInterval: 60000, // 1 minute
	enableNotifications: true,
	enableSounds: false,
	panels: PANELS.map((p) => ({
		id: p.id,
		name: p.name,
		enabled: p.defaultEnabled,
		order: p.order
	})),
	feedCategories: ['politics', 'tech', 'finance', 'gov', 'ai', 'intel']
};

// Load from localStorage
function loadSettings(): AppSettings {
	if (!browser) return defaultSettings;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			// Merge with defaults to handle new settings
			return { ...defaultSettings, ...parsed };
		}
	} catch (err) {
		console.error('[Settings] Failed to load:', err);
	}

	return defaultSettings;
}

// Reactive state
let settings = $state<AppSettings>(loadSettings());

// Derived values
const enabledPanels = $derived(settings.panels.filter((p) => p.enabled).sort((a, b) => a.order - b.order));
const isDarkMode = $derived(settings.theme === 'dark');

/**
 * Save settings to localStorage
 */
function persist(): void {
	if (!browser) return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch (err) {
		console.error('[Settings] Failed to save:', err);
	}
}

/**
 * Update a specific setting
 */
function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
	settings = { ...settings, [key]: value };
	persist();
}

/**
 * Toggle a panel's enabled state
 */
function togglePanel(panelId: string): void {
	settings = {
		...settings,
		panels: settings.panels.map((p) =>
			p.id === panelId ? { ...p, enabled: !p.enabled } : p
		)
	};
	persist();
}

/**
 * Set panel order
 */
function setPanelOrder(panelId: string, newOrder: number): void {
	settings = {
		...settings,
		panels: settings.panels.map((p) =>
			p.id === panelId ? { ...p, order: newOrder } : p
		)
	};
	persist();
}

/**
 * Toggle a feed category
 */
function toggleCategory(category: NewsCategory): void {
	const current = settings.feedCategories;
	const updated = current.includes(category)
		? current.filter((c) => c !== category)
		: [...current, category];

	settings = { ...settings, feedCategories: updated };
	persist();
}

/**
 * Toggle theme
 */
function toggleTheme(): void {
	settings = {
		...settings,
		theme: settings.theme === 'dark' ? 'light' : 'dark'
	};
	persist();

	// Update document class
	if (browser) {
		document.documentElement.classList.toggle('dark', settings.theme === 'dark');
	}
}

/**
 * Reset to defaults
 */
function reset(): void {
	settings = { ...defaultSettings };
	persist();
}

/**
 * Check if a panel is enabled
 */
function isPanelEnabled(panelId: string): boolean {
	return settings.panels.find((p) => p.id === panelId)?.enabled ?? false;
}

// Export store interface
export const settingsStore = {
	get settings() {
		return settings;
	},
	get enabledPanels() {
		return enabledPanels;
	},
	get isDarkMode() {
		return isDarkMode;
	},
	get refreshInterval() {
		return settings.refreshInterval;
	},
	update,
	togglePanel,
	setPanelOrder,
	toggleCategory,
	toggleTheme,
	isPanelEnabled,
	reset
};

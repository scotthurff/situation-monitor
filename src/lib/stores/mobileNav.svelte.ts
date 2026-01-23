/**
 * Mobile Navigation Store - Tab state and accordion expand state
 */

export type MobileTab = 'news' | 'map' | 'trends' | 'intel' | 'more';

export interface TabConfig {
	id: MobileTab;
	icon: string;
	label: string;
}

export const MOBILE_TABS: TabConfig[] = [
	{ id: 'news', icon: '📰', label: 'News' },
	{ id: 'map', icon: '🗺️', label: 'Map' },
	{ id: 'trends', icon: '📊', label: 'Trends' },
	{ id: 'intel', icon: '🔍', label: 'Intel' },
	{ id: 'more', icon: '☰', label: 'More' }
];

// Reactive state
let activeTab = $state<MobileTab>('news');
let moreExpanded = $state<Record<string, boolean>>({});
let intelSubTab = $state<'ai' | 'intel'>('ai');

/**
 * Set the active tab
 */
function setTab(tab: MobileTab): void {
	activeTab = tab;
}

/**
 * Toggle a panel in the More accordion
 */
function toggleMorePanel(panelId: string): void {
	moreExpanded = {
		...moreExpanded,
		[panelId]: !moreExpanded[panelId]
	};
}

/**
 * Close all expanded panels in More
 */
function collapseAllMore(): void {
	moreExpanded = {};
}

/**
 * Check if a More panel is expanded
 */
function isMoreExpanded(panelId: string): boolean {
	return moreExpanded[panelId] ?? false;
}

/**
 * Set the Intel sub-tab
 */
function setIntelSubTab(tab: 'ai' | 'intel'): void {
	intelSubTab = tab;
}

// Export store interface
export const mobileNavStore = {
	get activeTab() {
		return activeTab;
	},
	get moreExpanded() {
		return moreExpanded;
	},
	get intelSubTab() {
		return intelSubTab;
	},
	get tabs() {
		return MOBILE_TABS;
	},
	setTab,
	toggleMorePanel,
	collapseAllMore,
	isMoreExpanded,
	setIntelSubTab
};

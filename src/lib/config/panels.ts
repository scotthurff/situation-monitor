/**
 * Panel configuration and registry
 */

export interface PanelDefinition {
	id: string;
	name: string;
	description: string;
	defaultEnabled: boolean;
	category: 'news' | 'markets' | 'analysis' | 'intel' | 'misc' | 'politics' | 'legal' | 'immigration' | 'macro';
	refreshStage: 'critical' | 'secondary' | 'tertiary';
	order: number;
}

/**
 * All available panels - expanded for comprehensive US political intelligence
 */
export const PANELS: PanelDefinition[] = [
	// ===========================================
	// CRITICAL - Load first
	// ===========================================
	{
		id: 'news',
		name: 'News Feed',
		description: 'Real-time news from global sources',
		defaultEnabled: true,
		category: 'news',
		refreshStage: 'critical',
		order: 1
	},
	{
		id: 'alerts',
		name: 'Alerts',
		description: 'Breaking news and critical alerts',
		defaultEnabled: true,
		category: 'news',
		refreshStage: 'critical',
		order: 2
	},
	{
		id: 'uspolitics',
		name: 'US Politics',
		description: 'Congress, White House, and US political news',
		defaultEnabled: true,
		category: 'politics',
		refreshStage: 'critical',
		order: 3
	},
	{
		id: 'markets',
		name: 'Markets',
		description: 'Major indices and stock prices',
		defaultEnabled: true,
		category: 'markets',
		refreshStage: 'critical',
		order: 4
	},

	// ===========================================
	// SECONDARY - Load after critical
	// ===========================================

	// US Politics & Legal
	{
		id: 'courtcases',
		name: 'Court Watch',
		description: 'Supreme Court and federal court cases',
		defaultEnabled: true,
		category: 'legal',
		refreshStage: 'secondary',
		order: 5
	},
	{
		id: 'immigration',
		name: 'Immigration',
		description: 'ICE, border enforcement, and immigration policy',
		defaultEnabled: true,
		category: 'immigration',
		refreshStage: 'secondary',
		order: 6
	},
	{
		id: 'congress',
		name: 'Congress',
		description: 'Bills, votes, and legislative activity',
		defaultEnabled: true,
		category: 'politics',
		refreshStage: 'secondary',
		order: 7
	},

	// Markets & Macro
	{
		id: 'treasury',
		name: 'Treasury & Yields',
		description: 'Treasury yields and yield curve',
		defaultEnabled: true,
		category: 'macro',
		refreshStage: 'secondary',
		order: 8
	},
	{
		id: 'macroindicators',
		name: 'Macro Indicators',
		description: 'Key economic indicators from FRED',
		defaultEnabled: true,
		category: 'macro',
		refreshStage: 'secondary',
		order: 9
	},
	{
		id: 'crypto',
		name: 'Crypto',
		description: 'Cryptocurrency prices and trends',
		defaultEnabled: true,
		category: 'markets',
		refreshStage: 'secondary',
		order: 10
	},
	{
		id: 'commodities',
		name: 'Commodities',
		description: 'Gold, oil, and other commodities',
		defaultEnabled: true,
		category: 'markets',
		refreshStage: 'secondary',
		order: 11
	},

	// Intel & Analysis
	{
		id: 'intel',
		name: 'Intel',
		description: 'Think tank and defense analysis (balanced)',
		defaultEnabled: true,
		category: 'intel',
		refreshStage: 'secondary',
		order: 12
	},

	// ===========================================
	// TERTIARY - Load last
	// ===========================================

	// Fed & Fiscal
	{
		id: 'fed',
		name: 'Fed Watch',
		description: 'Federal Reserve data, FOMC, balance sheet',
		defaultEnabled: true,
		category: 'macro',
		refreshStage: 'tertiary',
		order: 13
	},
	{
		id: 'calendar',
		name: 'Economic Calendar',
		description: 'Upcoming economic releases',
		defaultEnabled: true,
		category: 'macro',
		refreshStage: 'tertiary',
		order: 14
	},
	{
		id: 'fiscal',
		name: 'Fiscal',
		description: 'Federal debt, deficit, and fiscal health',
		defaultEnabled: false,
		category: 'macro',
		refreshStage: 'tertiary',
		order: 15
	},

	// Analysis
	{
		id: 'correlation',
		name: 'Correlations',
		description: 'Cross-source pattern detection',
		defaultEnabled: true,
		category: 'analysis',
		refreshStage: 'tertiary',
		order: 16
	},
	{
		id: 'narrative',
		name: 'Narratives',
		description: 'Emerging story tracking',
		defaultEnabled: true,
		category: 'analysis',
		refreshStage: 'tertiary',
		order: 17
	},
	{
		id: 'mainchar',
		name: 'Main Character',
		description: 'Entity prominence analysis',
		defaultEnabled: true,
		category: 'analysis',
		refreshStage: 'tertiary',
		order: 18
	},
	{
		id: 'politicalfigures',
		name: 'Political Figures',
		description: 'Key political figures and their news',
		defaultEnabled: true,
		category: 'politics',
		refreshStage: 'tertiary',
		order: 19
	},

	// Misc
	{
		id: 'polymarket',
		name: 'Polymarket',
		description: 'Prediction market odds',
		defaultEnabled: false,
		category: 'misc',
		refreshStage: 'tertiary',
		order: 20
	},
	{
		id: 'map',
		name: 'World Map',
		description: 'Geopolitical hotspots',
		defaultEnabled: false,
		category: 'intel',
		refreshStage: 'tertiary',
		order: 21
	},

	// ===========================================
	// SITUATION WATCHES - Monitor specific crises
	// ===========================================
	{
		id: 'ainews',
		name: 'AI / Technology',
		description: 'AI research, products, and industry news',
		defaultEnabled: true,
		category: 'news',
		refreshStage: 'secondary',
		order: 22
	},
	{
		id: 'custommonitors',
		name: 'Custom Monitors',
		description: 'User-created keyword watches',
		defaultEnabled: true,
		category: 'analysis',
		refreshStage: 'tertiary',
		order: 23
	},
	{
		id: 'situation-greenland',
		name: 'Greenland Watch',
		description: 'US acquisition interest, Danish relations, Arctic sovereignty',
		defaultEnabled: false,
		category: 'intel',
		refreshStage: 'tertiary',
		order: 24
	},
	{
		id: 'situation-iran',
		name: 'Iran Watch',
		description: 'Revolution protests, regime instability & nuclear program',
		defaultEnabled: false,
		category: 'intel',
		refreshStage: 'tertiary',
		order: 25
	},
	{
		id: 'situation-venezuela',
		name: 'Venezuela Watch',
		description: 'Maduro regime, opposition, humanitarian crisis',
		defaultEnabled: false,
		category: 'intel',
		refreshStage: 'tertiary',
		order: 26
	},
	{
		id: 'situation-taiwan',
		name: 'Taiwan Watch',
		description: 'Cross-strait tensions, US-China relations, defense',
		defaultEnabled: false,
		category: 'intel',
		refreshStage: 'tertiary',
		order: 27
	},
	{
		id: 'situation-ukraine',
		name: 'Ukraine Watch',
		description: 'Russia-Ukraine war, NATO support, territorial disputes',
		defaultEnabled: false,
		category: 'intel',
		refreshStage: 'tertiary',
		order: 28
	}
];

/**
 * Get panels by category
 */
export function getPanelsByCategory(category: PanelDefinition['category']): PanelDefinition[] {
	return PANELS.filter((p) => p.category === category);
}

/**
 * Get panels by refresh stage
 */
export function getPanelsByStage(stage: PanelDefinition['refreshStage']): PanelDefinition[] {
	return PANELS.filter((p) => p.refreshStage === stage);
}

/**
 * Get default enabled panels
 */
export function getDefaultEnabledPanels(): PanelDefinition[] {
	return PANELS.filter((p) => p.defaultEnabled);
}

/**
 * Get panel by ID
 */
export function getPanelById(id: string): PanelDefinition | undefined {
	return PANELS.find((p) => p.id === id);
}

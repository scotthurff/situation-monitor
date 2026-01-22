/**
 * Situation/Crisis Watch configurations
 * Pre-configured monitors for ongoing geopolitical situations
 */

export interface SituationConfig {
	id: string;
	title: string;
	description: string;
	keywords: string[];
	icon?: string;
}

/**
 * Pre-configured situation watches
 */
export const SITUATIONS: SituationConfig[] = [
	{
		id: 'greenland',
		title: 'Greenland Situation',
		description: 'US acquisition interest, Danish relations, Arctic sovereignty',
		keywords: ['greenland', 'denmark', 'arctic', 'nuuk', 'trump greenland', 'danish'],
		icon: '🧊'
	},
	{
		id: 'iran',
		title: 'Iran Crisis',
		description: 'Revolution protests, regime instability & nuclear program',
		keywords: ['iran', 'tehran', 'khamenei', 'irgc', 'nuclear iran', 'sanctions iran', 'persian gulf'],
		icon: '☢️'
	},
	{
		id: 'venezuela',
		title: 'Venezuela Situation',
		description: 'Maduro regime, opposition, humanitarian crisis',
		keywords: ['venezuela', 'maduro', 'caracas', 'guaido', 'opposition venezuela', 'venezuelan'],
		icon: '🇻🇪'
	},
	{
		id: 'taiwan',
		title: 'Taiwan Strait',
		description: 'Cross-strait tensions, US-China relations, defense',
		keywords: ['taiwan', 'taipei', 'strait', 'tsai', 'pla', 'chinese military'],
		icon: '🇹🇼'
	},
	{
		id: 'ukraine',
		title: 'Ukraine Conflict',
		description: 'Russia-Ukraine war, NATO support, territorial disputes',
		keywords: ['ukraine', 'kyiv', 'zelensky', 'crimea', 'donbas', 'russian invasion'],
		icon: '🇺🇦'
	}
];

/**
 * Get a situation by ID
 */
export function getSituationById(id: string): SituationConfig | undefined {
	return SITUATIONS.find((s) => s.id === id);
}

/**
 * Get all situation IDs
 */
export function getSituationIds(): string[] {
	return SITUATIONS.map((s) => s.id);
}

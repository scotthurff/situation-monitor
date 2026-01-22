/**
 * Main Character Analysis - Track entity prominence in news
 */

import type { NewsItem, MainCharacter } from '$lib/types';
import { detectSentiment } from '$lib/config/keywords';

/**
 * Known entities to track (can be extended)
 */
const KNOWN_ENTITIES = [
	// Political Leaders
	'Biden',
	'Trump',
	'Putin',
	'Xi Jinping',
	'Zelensky',
	'Netanyahu',
	'Modi',
	'Macron',
	'Scholz',
	'Sunak',
	'Milei',

	// Tech Leaders
	'Elon Musk',
	'Sam Altman',
	'Satya Nadella',
	'Tim Cook',
	'Sundar Pichai',
	'Mark Zuckerberg',
	'Jensen Huang',

	// Finance
	'Jerome Powell',
	'Janet Yellen',
	'Christine Lagarde',
	'Warren Buffett',

	// Companies
	'OpenAI',
	'Google',
	'Microsoft',
	'Apple',
	'Amazon',
	'Meta',
	'NVIDIA',
	'Tesla',
	'SpaceX',

	// Organizations
	'Federal Reserve',
	'NATO',
	'UN',
	'WHO',
	'IMF',
	'OPEC',
	'European Union'
];

/**
 * Extract entities from text
 */
function extractEntities(text: string): string[] {
	const found: string[] = [];
	const lowerText = text.toLowerCase();

	for (const entity of KNOWN_ENTITIES) {
		if (lowerText.includes(entity.toLowerCase())) {
			found.push(entity);
		}
	}

	// Also extract capitalized words/phrases as potential entities
	const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
	const matches = text.match(capitalizedPattern) || [];

	for (const match of matches) {
		if (
			match.length > 3 &&
			!found.includes(match) &&
			!isCommonWord(match)
		) {
			found.push(match);
		}
	}

	return found;
}

/**
 * Check if word is a common word (not an entity)
 */
function isCommonWord(word: string): boolean {
	const common = new Set([
		'The',
		'This',
		'That',
		'These',
		'Those',
		'What',
		'When',
		'Where',
		'Which',
		'While',
		'After',
		'Before',
		'During',
		'Since',
		'Until',
		'About',
		'Against',
		'Between',
		'Through',
		'During',
		'Without',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday',
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
		'Today',
		'Yesterday',
		'Tomorrow',
		'News',
		'Report',
		'Update',
		'Breaking'
	]);
	return common.has(word);
}

/**
 * Analyze main characters in news
 */
export function analyzeMainCharacters(items: NewsItem[], limit = 10): MainCharacter[] {
	const entityData = new Map<
		string,
		{
			mentions: number;
			sources: Set<string>;
			headlines: string[];
			sentiments: Array<'positive' | 'negative' | 'neutral'>;
			lastMentioned: Date;
		}
	>();

	for (const item of items) {
		const text = `${item.title} ${item.description || ''}`;
		const entities = extractEntities(text);
		const sentiment = detectSentiment(text);

		for (const entity of entities) {
			const data = entityData.get(entity) || {
				mentions: 0,
				sources: new Set(),
				headlines: [],
				sentiments: [],
				lastMentioned: item.pubDate
			};

			data.mentions++;
			data.sources.add(item.source);
			if (data.headlines.length < 5) {
				data.headlines.push(item.title);
			}
			data.sentiments.push(sentiment);
			if (item.pubDate > data.lastMentioned) {
				data.lastMentioned = item.pubDate;
			}

			entityData.set(entity, data);
		}
	}

	// Convert to MainCharacter objects
	const characters: MainCharacter[] = [];

	for (const [name, data] of entityData) {
		if (data.mentions < 2) continue; // Filter out single mentions

		// Calculate overall sentiment
		const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
		for (const s of data.sentiments) {
			sentimentCounts[s]++;
		}

		let sentiment: MainCharacter['sentiment'];
		const total = data.sentiments.length;
		if (
			sentimentCounts.positive > total * 0.6 &&
			sentimentCounts.negative < total * 0.2
		) {
			sentiment = 'positive';
		} else if (
			sentimentCounts.negative > total * 0.6 &&
			sentimentCounts.positive < total * 0.2
		) {
			sentiment = 'negative';
		} else if (
			sentimentCounts.positive > total * 0.3 &&
			sentimentCounts.negative > total * 0.3
		) {
			sentiment = 'mixed';
		} else {
			sentiment = 'neutral';
		}

		characters.push({
			name,
			mentions: data.mentions,
			sources: Array.from(data.sources),
			sentiment,
			recentHeadlines: data.headlines,
			lastMentioned: data.lastMentioned
		});
	}

	// Sort by mentions (most prominent first)
	characters.sort((a, b) => b.mentions - a.mentions);

	return characters.slice(0, limit);
}

/**
 * Get the current "main character" of the news cycle
 */
export function getCurrentMainCharacter(items: NewsItem[]): MainCharacter | null {
	const characters = analyzeMainCharacters(items, 1);
	return characters[0] || null;
}

/**
 * Track entity mentions over time
 */
export function trackEntityOverTime(
	items: NewsItem[],
	entity: string
): Array<{ date: Date; mentions: number }> {
	const byDay = new Map<string, number>();
	const lowerEntity = entity.toLowerCase();

	for (const item of items) {
		const text = `${item.title} ${item.description || ''}`.toLowerCase();
		if (text.includes(lowerEntity)) {
			const dateKey = item.pubDate.toISOString().split('T')[0];
			byDay.set(dateKey, (byDay.get(dateKey) || 0) + 1);
		}
	}

	return Array.from(byDay.entries())
		.map(([date, mentions]) => ({ date: new Date(date), mentions }))
		.sort((a, b) => a.date.getTime() - b.date.getTime());
}

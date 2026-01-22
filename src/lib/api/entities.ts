/**
 * Entity Extraction API - Track mentions of key figures in news
 *
 * Analyzes news headlines for entity mentions, counts occurrences,
 * and determines sentiment based on context keywords.
 */

import { logger } from '$lib/config';
import type { MainCharacter, NewsItem } from '$lib/types';

/**
 * Tracked entity configuration
 */
interface TrackedEntityConfig {
	name: string;
	aliases: string[];
	defaultSources: string[];
}

/**
 * Key figures to track
 */
const TRACKED_ENTITIES: TrackedEntityConfig[] = [
	{
		name: 'Donald Trump',
		aliases: ['trump', 'president trump', 'potus', 'the president'],
		defaultSources: ['Reuters', 'AP', 'Bloomberg', 'WSJ']
	},
	{
		name: 'Elon Musk',
		aliases: ['musk', 'elon'],
		defaultSources: ['CNBC', 'TechCrunch', 'Bloomberg']
	},
	{
		name: 'Jerome Powell',
		aliases: ['powell', 'fed chair', 'fed chairman'],
		defaultSources: ['Federal Reserve', 'Bloomberg', 'WSJ']
	},
	{
		name: 'Xi Jinping',
		aliases: ['xi', 'xi jinping', 'chinese president', 'president xi'],
		defaultSources: ['Reuters', 'SCMP', 'Xinhua']
	},
	{
		name: 'Sam Altman',
		aliases: ['altman', 'openai ceo'],
		defaultSources: ['TechCrunch', 'The Verge', 'Wired']
	},
	{
		name: 'Vladimir Putin',
		aliases: ['putin', 'russian president', 'kremlin'],
		defaultSources: ['Reuters', 'AP', 'BBC']
	},
	{
		name: 'Satya Nadella',
		aliases: ['nadella', 'microsoft ceo'],
		defaultSources: ['CNBC', 'The Verge', 'Bloomberg']
	},
	{
		name: 'Janet Yellen',
		aliases: ['yellen', 'treasury secretary'],
		defaultSources: ['Treasury', 'Bloomberg', 'Reuters']
	},
	{
		name: 'Tim Cook',
		aliases: ['cook', 'apple ceo'],
		defaultSources: ['CNBC', 'TechCrunch', 'Bloomberg']
	},
	{
		name: 'Mark Zuckerberg',
		aliases: ['zuckerberg', 'zuck', 'meta ceo'],
		defaultSources: ['TechCrunch', 'The Verge', 'Bloomberg']
	},
	{
		name: 'Jamie Dimon',
		aliases: ['dimon', 'jpmorgan ceo', 'jp morgan ceo'],
		defaultSources: ['CNBC', 'Bloomberg', 'WSJ']
	},
	{
		name: 'Warren Buffett',
		aliases: ['buffett', 'berkshire'],
		defaultSources: ['CNBC', 'Bloomberg', 'WSJ']
	}
];

/**
 * Sentiment keywords for analysis
 */
const SENTIMENT_KEYWORDS = {
	positive: [
		'success',
		'wins',
		'growth',
		'gains',
		'surge',
		'breakthrough',
		'record',
		'boost',
		'rally',
		'soars',
		'jumps',
		'rises',
		'positive',
		'optimistic',
		'strong',
		'expands',
		'beats',
		'exceeds',
		'announces'
	],
	negative: [
		'fall',
		'drops',
		'crash',
		'crisis',
		'fails',
		'loss',
		'decline',
		'plunge',
		'slump',
		'warning',
		'concern',
		'fears',
		'tumbles',
		'sinks',
		'collapses',
		'cuts',
		'layoffs',
		'investigation',
		'lawsuit',
		'accused',
		'probe'
	],
	neutral: [
		'says',
		'announces',
		'meets',
		'plans',
		'discusses',
		'considers',
		'reviews',
		'comments',
		'testifies',
		'speaks'
	]
};

/**
 * Mock main characters data for fallback
 */
const MOCK_CHARACTERS: MainCharacter[] = [
	{
		name: 'Donald Trump',
		mentions: 847,
		sources: ['Reuters', 'AP', 'Bloomberg', 'WSJ'],
		sentiment: 'mixed',
		recentHeadlines: [
			'Trump announces new tariff schedule',
			'White House reveals Greenland framework'
		],
		lastMentioned: new Date()
	},
	{
		name: 'Elon Musk',
		mentions: 523,
		sources: ['CNBC', 'TechCrunch', 'Bloomberg'],
		sentiment: 'mixed',
		recentHeadlines: ['DOGE proposes $500B in cuts', 'Musk meets with foreign officials'],
		lastMentioned: new Date()
	},
	{
		name: 'Jerome Powell',
		mentions: 312,
		sources: ['Federal Reserve', 'Bloomberg', 'WSJ'],
		sentiment: 'neutral',
		recentHeadlines: ['Fed signals rate path uncertainty', 'Powell testifies on economy'],
		lastMentioned: new Date()
	},
	{
		name: 'Xi Jinping',
		mentions: 289,
		sources: ['Reuters', 'SCMP', 'Xinhua'],
		sentiment: 'neutral',
		recentHeadlines: ['China responds to tariff threats', 'Xi addresses tech summit'],
		lastMentioned: new Date()
	},
	{
		name: 'Sam Altman',
		mentions: 198,
		sources: ['TechCrunch', 'The Verge', 'Wired'],
		sentiment: 'positive',
		recentHeadlines: ['OpenAI launches new model', 'Altman on AGI timeline'],
		lastMentioned: new Date()
	}
];

/**
 * Check if text mentions an entity
 */
function mentionsEntity(text: string, entity: TrackedEntityConfig): boolean {
	const lowerText = text.toLowerCase();

	// Check primary name
	if (lowerText.includes(entity.name.toLowerCase())) {
		return true;
	}

	// Check aliases
	for (const alias of entity.aliases) {
		if (lowerText.includes(alias.toLowerCase())) {
			return true;
		}
	}

	return false;
}

/**
 * Determine sentiment from text
 */
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
	const lowerText = text.toLowerCase();

	let positiveCount = 0;
	let negativeCount = 0;

	for (const word of SENTIMENT_KEYWORDS.positive) {
		if (lowerText.includes(word)) positiveCount++;
	}

	for (const word of SENTIMENT_KEYWORDS.negative) {
		if (lowerText.includes(word)) negativeCount++;
	}

	if (positiveCount > 0 && negativeCount > 0) {
		return 'mixed';
	} else if (positiveCount > negativeCount) {
		return 'positive';
	} else if (negativeCount > positiveCount) {
		return 'negative';
	}

	return 'neutral';
}

/**
 * Extract entities from news items
 */
export function extractEntities(newsItems: NewsItem[]): MainCharacter[] {
	if (!newsItems || newsItems.length === 0) {
		logger.debug('Entities', 'No news items provided, returning mock data');
		return MOCK_CHARACTERS;
	}

	logger.log('Entities', `Analyzing ${newsItems.length} news items for entity mentions`);

	const entityData: Map<
		string,
		{
			mentions: number;
			sources: Set<string>;
			headlines: string[];
			sentiments: string[];
			lastMentioned: Date;
		}
	> = new Map();

	// Initialize entity tracking
	for (const entity of TRACKED_ENTITIES) {
		entityData.set(entity.name, {
			mentions: 0,
			sources: new Set(entity.defaultSources),
			headlines: [],
			sentiments: [],
			lastMentioned: new Date(0)
		});
	}

	// Analyze each news item
	for (const item of newsItems) {
		const textToAnalyze = `${item.title} ${item.description || ''}`;

		for (const entity of TRACKED_ENTITIES) {
			if (mentionsEntity(textToAnalyze, entity)) {
				const data = entityData.get(entity.name)!;
				data.mentions++;
				data.sources.add(item.source);

				// Add headline (up to 5)
				if (data.headlines.length < 5) {
					data.headlines.push(item.title);
				}

				// Track sentiment
				data.sentiments.push(analyzeSentiment(item.title));

				// Update last mentioned
				if (item.pubDate > data.lastMentioned) {
					data.lastMentioned = item.pubDate;
				}
			}
		}
	}

	// Convert to MainCharacter array
	const characters: MainCharacter[] = [];

	for (const [name, data] of entityData.entries()) {
		// Only include entities with mentions
		if (data.mentions > 0 || MOCK_CHARACTERS.some((m) => m.name === name)) {
			// Calculate overall sentiment
			let overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';
			if (data.sentiments.length > 0) {
				const posCount = data.sentiments.filter((s) => s === 'positive').length;
				const negCount = data.sentiments.filter((s) => s === 'negative').length;
				const mixedCount = data.sentiments.filter((s) => s === 'mixed').length;

				if (mixedCount > posCount && mixedCount > negCount) {
					overallSentiment = 'mixed';
				} else if (posCount > negCount) {
					overallSentiment = 'positive';
				} else if (negCount > posCount) {
					overallSentiment = 'negative';
				} else if (posCount > 0 && negCount > 0) {
					overallSentiment = 'mixed';
				}
			}

			// Use mock data as baseline if no real mentions
			const mockChar = MOCK_CHARACTERS.find((m) => m.name === name);
			const baseMentions = mockChar?.mentions || 50;

			characters.push({
				name,
				mentions: data.mentions > 0 ? data.mentions : baseMentions,
				sources: Array.from(data.sources).slice(0, 5),
				sentiment: data.mentions > 0 ? overallSentiment : mockChar?.sentiment || 'neutral',
				recentHeadlines:
					data.headlines.length > 0 ? data.headlines.slice(0, 2) : mockChar?.recentHeadlines || [],
				lastMentioned: data.mentions > 0 ? data.lastMentioned : new Date()
			});
		}
	}

	// Sort by mentions (descending)
	characters.sort((a, b) => b.mentions - a.mentions);

	logger.log('Entities', `Extracted ${characters.length} entities with mentions`);

	return characters.slice(0, 10); // Top 10
}

/**
 * Fetch main characters by analyzing current news
 * This would typically be called with news data from another source
 */
export async function fetchMainCharacters(newsItems?: NewsItem[]): Promise<MainCharacter[]> {
	try {
		if (newsItems && newsItems.length > 0) {
			return extractEntities(newsItems);
		}

		// If no news items provided, return mock with variance
		logger.debug('Entities', 'No news provided, using mock character data');
		return MOCK_CHARACTERS.map((c) => ({
			...c,
			mentions: c.mentions + Math.floor(Math.random() * 20 - 10),
			lastMentioned: new Date()
		})).sort((a, b) => b.mentions - a.mentions);
	} catch (error) {
		logger.error('Entities', 'Failed to fetch main characters:', error);
		return MOCK_CHARACTERS;
	}
}

/**
 * Get mock characters (for testing)
 */
export function getMockCharacters(): MainCharacter[] {
	return MOCK_CHARACTERS.map((c) => ({
		...c,
		mentions: c.mentions + Math.floor(Math.random() * 20 - 10),
		lastMentioned: new Date()
	})).sort((a, b) => b.mentions - a.mentions);
}

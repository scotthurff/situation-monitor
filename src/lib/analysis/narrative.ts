/**
 * Narrative Tracking - Track story evolution from fringe to mainstream
 */

import type { NewsItem, Narrative } from '$lib/types';
import { generateId } from '$lib/utils';

/**
 * Source tiers for narrative progression
 */
const SOURCE_TIERS: Record<string, 'fringe' | 'alternative' | 'mainstream'> = {
	// Mainstream
	'BBC World': 'mainstream',
	'NPR News': 'mainstream',
	'Guardian World': 'mainstream',
	'NYT World': 'mainstream',
	'CNBC': 'mainstream',
	'Bloomberg': 'mainstream',
	'Reuters': 'mainstream',
	'AP News': 'mainstream',

	// Alternative
	'Hacker News': 'alternative',
	'Ars Technica': 'alternative',
	'The Verge': 'alternative',
	'Defense One': 'alternative',
	'War on the Rocks': 'alternative',
	'The Diplomat': 'alternative',

	// Fringe/Specialized
	'Bellingcat': 'fringe',
	'CSIS': 'fringe',
	'Brookings': 'fringe',
	'CFR': 'fringe',
	'ArXiv AI': 'fringe',
	'Krebs Security': 'fringe'
};

/**
 * Get source tier
 */
function getSourceTier(source: string): 'fringe' | 'alternative' | 'mainstream' {
	return SOURCE_TIERS[source] || 'alternative';
}

/**
 * Extract key phrases from text
 */
function extractPhrases(text: string): string[] {
	const cleaned = text.toLowerCase().replace(/[^\w\s]/g, ' ');
	const words = cleaned.split(/\s+/).filter((w) => w.length > 3);

	// Extract 2-3 word phrases
	const phrases: string[] = [];
	for (let i = 0; i < words.length - 1; i++) {
		if (isSignificantWord(words[i]) && isSignificantWord(words[i + 1])) {
			phrases.push(`${words[i]} ${words[i + 1]}`);
		}
		if (i < words.length - 2 && isSignificantWord(words[i + 2])) {
			phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
		}
	}

	return phrases;
}

/**
 * Check if word is significant (not a stop word)
 */
function isSignificantWord(word: string): boolean {
	const stopWords = new Set([
		'the',
		'and',
		'for',
		'are',
		'but',
		'not',
		'you',
		'all',
		'can',
		'was',
		'one',
		'our',
		'out',
		'has',
		'have',
		'had',
		'his',
		'her',
		'how',
		'its',
		'may',
		'new',
		'now',
		'say',
		'says',
		'said',
		'will',
		'with',
		'from',
		'they',
		'been',
		'this',
		'that',
		'were',
		'would',
		'could',
		'about',
		'after',
		'more',
		'some',
		'what',
		'when',
		'which',
		'their',
		'there',
		'these',
		'those'
	]);
	return !stopWords.has(word) && word.length > 3;
}

/**
 * Track narratives across news items
 */
export function trackNarratives(items: NewsItem[], minMentions = 3): Narrative[] {
	// Group items by time window (last 24h, last week, etc.)
	const now = Date.now();
	const day = 24 * 60 * 60 * 1000;

	// Extract phrases and track their sources
	const phraseData = new Map<
		string,
		{
			mentions: number;
			sources: Set<string>;
			tiers: Set<'fringe' | 'alternative' | 'mainstream'>;
			firstSeen: Date;
			lastSeen: Date;
			items: NewsItem[];
		}
	>();

	for (const item of items) {
		const phrases = extractPhrases(`${item.title} ${item.description || ''}`);
		const tier = getSourceTier(item.source);

		for (const phrase of phrases) {
			const data = phraseData.get(phrase) || {
				mentions: 0,
				sources: new Set(),
				tiers: new Set(),
				firstSeen: item.pubDate,
				lastSeen: item.pubDate,
				items: []
			};

			data.mentions++;
			data.sources.add(item.source);
			data.tiers.add(tier);
			if (item.pubDate < data.firstSeen) data.firstSeen = item.pubDate;
			if (item.pubDate > data.lastSeen) data.lastSeen = item.pubDate;
			data.items.push(item);

			phraseData.set(phrase, data);
		}
	}

	// Convert to narratives
	const narratives: Narrative[] = [];

	for (const [phrase, data] of phraseData) {
		if (data.mentions < minMentions) continue;
		if (data.sources.size < 2) continue; // Require multiple sources

		// Determine stage based on source tiers
		let stage: Narrative['stage'];
		if (data.tiers.has('mainstream') && data.tiers.size >= 2) {
			stage = 'mainstream';
		} else if (data.tiers.has('alternative') && data.sources.size >= 3) {
			stage = 'developing';
		} else if (data.tiers.has('mainstream')) {
			stage = 'mainstream';
		} else {
			stage = 'emerging';
		}

		// Determine trajectory based on timing
		const ageHours = (now - data.firstSeen.getTime()) / (60 * 60 * 1000);
		const recencyHours = (now - data.lastSeen.getTime()) / (60 * 60 * 1000);
		let trajectory: Narrative['trajectory'];

		if (recencyHours < 6 && data.mentions >= 5) {
			trajectory = 'rising';
		} else if (recencyHours > 24) {
			trajectory = 'falling';
		} else {
			trajectory = 'stable';
		}

		narratives.push({
			id: generateId(),
			topic: phrase,
			stage,
			mentions: data.mentions,
			sources: Array.from(data.sources),
			firstSeen: data.firstSeen,
			lastSeen: data.lastSeen,
			trajectory
		});
	}

	// Sort by trajectory (rising first) then mentions
	const trajectoryOrder = { rising: 0, stable: 1, falling: 2 };
	narratives.sort((a, b) => {
		const trajDiff = trajectoryOrder[a.trajectory] - trajectoryOrder[b.trajectory];
		if (trajDiff !== 0) return trajDiff;
		return b.mentions - a.mentions;
	});

	return narratives.slice(0, 20);
}

/**
 * Find emerging narratives (fringe -> mainstream)
 */
export function findEmergingNarratives(items: NewsItem[]): Narrative[] {
	const narratives = trackNarratives(items, 2);
	return narratives.filter((n) => n.stage === 'emerging' && n.trajectory === 'rising');
}

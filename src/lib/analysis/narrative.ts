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
 * Common English words that are never proper nouns
 * These get filtered out to reduce noise
 */
const COMMON_WORDS = new Set([
	// Conjunctions and prepositions that may appear capitalized
	'with', 'after', 'before', 'during', 'while', 'from', 'into', 'over',
	'under', 'through', 'between', 'about', 'around', 'against', 'along',
	// Verbs commonly capitalized in headlines
	'says', 'said', 'tells', 'told', 'asks', 'asked', 'makes', 'made',
	'gets', 'take', 'takes', 'took', 'goes', 'went', 'comes', 'came',
	'sees', 'seen', 'shows', 'shown', 'calls', 'called', 'warns', 'warns',
	'know', 'knows', 'knew', 'think', 'thinks', 'thought', 'look', 'looks',
	'looked', 'find', 'finds', 'found', 'give', 'gives', 'gave', 'need',
	'needs', 'needed', 'want', 'wants', 'wanted', 'keep', 'keeps', 'kept',
	// Adverbs and adjectives
	'just', 'only', 'even', 'also', 'still', 'already', 'here', 'there',
	'first', 'last', 'next', 'more', 'most', 'some', 'many', 'other',
	'every', 'each', 'both', 'another', 'such', 'same', 'different',
	// Pronouns and determiners
	'this', 'that', 'these', 'those', 'what', 'which', 'where', 'when',
	'will', 'would', 'could', 'should', 'must', 'might', 'being', 'having',
	// Generic political/news terms
	'house', 'senate', 'court', 'bill', 'vote', 'deal', 'plan', 'report',
	'news', 'update', 'breaking', 'live', 'watch', 'read', 'latest',
	// Common headline words that aren't meaningful topics
	'week', 'year', 'years', 'month', 'months', 'days', 'today', 'tonight',
	'inside', 'outside', 'behind', 'front', 'back', 'above', 'below',
	'york', 'city', 'state', 'county', 'national', 'international', 'global',
	'america', 'american', 'world', 'times', 'post', 'journal', 'tribune',
	'meet', 'meets', 'meeting', 'talk', 'talks', 'talking', 'speech',
	'move', 'moves', 'moving', 'turn', 'turns', 'turning', 'start', 'starts',
	'stop', 'stops', 'stopping', 'help', 'helps', 'helping', 'lead', 'leads',
	'face', 'faces', 'facing', 'hold', 'holds', 'holding', 'push', 'pushes',
	'pull', 'pulls', 'fight', 'fights', 'fighting', 'rise', 'rises', 'rising',
	'fall', 'falls', 'falling', 'open', 'opens', 'opening', 'close', 'closes',
	'begin', 'begins', 'beginning', 'continue', 'continues', 'continuing',
	'three', 'four', 'five', 'million', 'billion', 'percent', 'biggest'
]);

/**
 * Context words that add meaning when paired with proper nouns
 * These help form more descriptive topic names like "Trump Tariffs" or "China Trade"
 */
const CONTEXT_WORDS = new Set([
	// Actions/events
	'tariffs', 'sanctions', 'talks', 'deal', 'summit', 'war', 'crisis', 'election',
	'vote', 'bill', 'probe', 'trial', 'ruling', 'order', 'ban', 'attack', 'strike',
	'raid', 'arrest', 'indictment', 'charges', 'hearing', 'testimony', 'speech',
	'visit', 'meeting', 'agreement', 'treaty', 'alliance', 'conflict', 'ceasefire',
	// Topics
	'trade', 'policy', 'reform', 'budget', 'debt', 'economy', 'inflation', 'jobs',
	'immigration', 'border', 'climate', 'energy', 'tech', 'ai', 'security', 'defense',
	'military', 'nuclear', 'missiles', 'troops', 'funding', 'spending', 'cuts',
	'shutdown', 'impeachment', 'investigation', 'scandal', 'controversy', 'backlash',
	// Relationships
	'relations', 'tensions', 'dispute', 'standoff', 'negotiations', 'diplomacy',
	// Outcomes
	'approval', 'rejection', 'victory', 'defeat', 'breakthrough', 'failure', 'collapse'
]);

/**
 * Extract key phrases from a headline using smarter heuristics
 * Prioritizes multi-word phrases that provide context
 */
function extractPhrases(title: string): string[] {
	const phrases: string[] = [];

	// Clean but preserve case for proper noun detection
	const cleaned = title.replace(/[^\w\s'-]/g, ' ').replace(/\s+/g, ' ').trim();
	const words = cleaned.split(' ');
	const lowerWords = words.map(w => w.toLowerCase());

	// Strategy 1: Extract "Proper Noun + Context Word" patterns
	// e.g., "Trump Tariffs", "China Trade", "Biden Immigration"
	for (let i = 0; i < words.length - 1; i++) {
		const word = words[i];
		const nextWord = words[i + 1];
		const nextLower = lowerWords[i + 1];

		// Proper noun followed by context word
		if (/^[A-Z][a-z]+/.test(word) && word.length >= 3) {
			if (CONTEXT_WORDS.has(nextLower)) {
				phrases.push(`${word} ${nextWord}`);
			}
		}

		// Context word followed by proper noun (e.g., "Trade War", when about China Trade War)
		if (CONTEXT_WORDS.has(lowerWords[i]) && /^[A-Z][a-z]+/.test(nextWord) && nextWord.length >= 3) {
			phrases.push(`${word} ${nextWord}`);
		}
	}

	// Strategy 2: Extract consecutive capitalized words (proper nouns/names)
	// Allow short connectors (of, the, and) in the middle
	let currentPhrase: string[] = [];
	for (let i = 0; i < words.length; i++) {
		const word = words[i];
		const isCapitalized = /^[A-Z]/.test(word) && word.length > 1;
		const isConnector = ['of', 'the', 'and', 'for', 'in', 'on', 'at', 'to'].includes(lowerWords[i]);

		if (isCapitalized) {
			currentPhrase.push(word);
		} else if (isConnector && currentPhrase.length > 0) {
			// Only include connector if followed by another capitalized word
			if (i + 1 < words.length && /^[A-Z]/.test(words[i + 1])) {
				currentPhrase.push(word);
			} else {
				// End phrase here
				if (currentPhrase.length >= 2) {
					phrases.push(currentPhrase.join(' '));
				}
				currentPhrase = [];
			}
		} else {
			if (currentPhrase.length >= 2) {
				phrases.push(currentPhrase.join(' '));
			}
			currentPhrase = [];
		}
	}
	// Don't forget trailing phrase
	if (currentPhrase.length >= 2) {
		phrases.push(currentPhrase.join(' '));
	}

	// Strategy 3: Find mid-sentence capitalized words (definitely proper nouns)
	// Include these even if they appear in multi-word phrases - they provide additional signal
	for (let i = 1; i < words.length; i++) {
		const word = words[i];
		// Mid-sentence capitalized word with 4+ letters = almost certainly a proper noun
		if (/^[A-Z][a-z]+/.test(word) && word.length >= 4) {
			phrases.push(word);
		}
	}

	// Strategy 4: First word if it looks like a proper noun (name pattern)
	// Only add if it's 4+ letters to avoid generic words like "The", "New"
	if (words.length > 0 && /^[A-Z][a-z]+/.test(words[0]) && words[0].length >= 4) {
		phrases.push(words[0]);
	}

	// Dedupe, filter out common words, and prioritize multi-word phrases
	const unique = [...new Set(phrases)];
	const filtered = unique.filter(p => p.length >= 4 && !COMMON_WORDS.has(p.toLowerCase()));

	// Sort by word count (prefer longer phrases) then alphabetically
	filtered.sort((a, b) => {
		const aWords = a.split(' ').length;
		const bWords = b.split(' ').length;
		if (bWords !== aWords) return bWords - aWords;
		return a.localeCompare(b);
	});

	return filtered;
}

/**
 * Track narratives across news items
 */
export function trackNarratives(items: NewsItem[], minMentions = 2): Narrative[] {
	// Group items by time window (last 24h, last week, etc.)
	const now = Date.now();
	const day = 24 * 60 * 60 * 1000;

	// Extract phrases and track their sources
	const phraseData = new Map<
		string,
		{
			displayName: string; // Original case for display
			mentions: number;
			sources: Set<string>;
			tiers: Set<'fringe' | 'alternative' | 'mainstream'>;
			firstSeen: Date;
			lastSeen: Date;
			items: NewsItem[];
		}
	>();

	for (const item of items) {
		// Extract from title only - headlines are curated, descriptions have boilerplate
		const phrases = extractPhrases(item.title);
		const tier = getSourceTier(item.source);

		for (const phrase of phrases) {
			// Normalize to lowercase for grouping, but store original case for display
			const key = phrase.toLowerCase();
			const existing = phraseData.get(key);

			if (existing) {
				existing.mentions++;
				existing.sources.add(item.source);
				existing.tiers.add(tier);
				if (item.pubDate < existing.firstSeen) existing.firstSeen = item.pubDate;
				if (item.pubDate > existing.lastSeen) existing.lastSeen = item.pubDate;
				existing.items.push(item);
			} else {
				phraseData.set(key, {
					displayName: phrase, // Keep original case for display
					mentions: 1,
					sources: new Set([item.source]),
					tiers: new Set([tier]),
					firstSeen: item.pubDate,
					lastSeen: item.pubDate,
					items: [item]
				});
			}
		}
	}

	// Convert to narratives
	const narratives: Narrative[] = [];

	for (const [key, data] of phraseData) {
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

		// Deduplicate items by ID, sort by date (most recent first), and limit to 10
		const uniqueItems = Array.from(new Map(data.items.map((item) => [item.id, item])).values());
		const sortedItems = uniqueItems
			.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
			.slice(0, 10);

		narratives.push({
			id: generateId(),
			topic: data.displayName,
			stage,
			mentions: data.mentions,
			sources: Array.from(data.sources),
			firstSeen: data.firstSeen,
			lastSeen: data.lastSeen,
			trajectory,
			items: sortedItems
		});
	}

	// Sort by trajectory (rising first) then mentions
	const trajectoryOrder = { rising: 0, stable: 1, falling: 2 };
	narratives.sort((a, b) => {
		const trajDiff = trajectoryOrder[a.trajectory] - trajectoryOrder[b.trajectory];
		if (trajDiff !== 0) return trajDiff;
		return b.mentions - a.mentions;
	});

	// Deduplicate overlapping phrases - if a shorter phrase is substring of longer, keep the longer
	const deduped = narratives.filter((narrative, i) => {
		const topic = narrative.topic.toLowerCase();
		// Check if any other narrative with more mentions contains this as substring
		return !narratives.some(
			(other, j) =>
				i !== j &&
				other.mentions >= narrative.mentions &&
				other.topic.toLowerCase().includes(topic) &&
				other.topic.length > narrative.topic.length
		);
	});

	return deduped.slice(0, 20);
}

/**
 * Find emerging narratives (fringe -> mainstream)
 */
export function findEmergingNarratives(items: NewsItem[]): Narrative[] {
	const narratives = trackNarratives(items, 2);
	return narratives.filter((n) => n.stage === 'emerging' && n.trajectory === 'rising');
}

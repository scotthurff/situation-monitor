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
 * Known person names for phrase ordering (person names come first)
 */
const KNOWN_PERSONS = new Set([
	'trump', 'biden', 'obama', 'putin', 'xi', 'jinping', 'zelensky', 'netanyahu',
	'macron', 'scholz', 'sunak', 'trudeau', 'modi', 'kim', 'jong', 'musk', 'bezos',
	'zuckerberg', 'altman', 'cook', 'nadella', 'pichai', 'powell', 'yellen'
]);

/**
 * Known organizations for phrase ordering (after persons, before locations)
 */
const KNOWN_ORGS = new Set([
	'fed', 'federal', 'reserve', 'nato', 'who', 'imf', 'ecb', 'opec', 'sec', 'fbi',
	'cia', 'nsa', 'doj', 'dhs', 'pentagon', 'congress', 'senate', 'house', 'scotus',
	'google', 'apple', 'microsoft', 'amazon', 'meta', 'openai', 'anthropic', 'tesla',
	'spacex', 'nvidia', 'intel', 'tsmc', 'samsung', 'huawei', 'tiktok', 'twitter'
]);

/**
 * Known locations for phrase ordering (after orgs, before topics)
 */
const KNOWN_LOCATIONS = new Set([
	'china', 'chinese', 'russia', 'russian', 'ukraine', 'ukrainian', 'taiwan',
	'iran', 'iranian', 'israel', 'israeli', 'gaza', 'palestinian', 'korea', 'korean',
	'japan', 'japanese', 'india', 'indian', 'europe', 'european', 'germany', 'german',
	'france', 'french', 'britain', 'british', 'canada', 'canadian', 'mexico', 'mexican',
	'brazil', 'brazilian', 'middle', 'east', 'asia', 'pacific', 'africa', 'african'
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
 * Get phrase type for ordering (person > org > location > topic)
 */
function getPhraseType(phrase: string): 'person' | 'org' | 'location' | 'topic' {
	const words = phrase.toLowerCase().split(' ');
	for (const word of words) {
		if (KNOWN_PERSONS.has(word)) return 'person';
	}
	for (const word of words) {
		if (KNOWN_ORGS.has(word)) return 'org';
	}
	for (const word of words) {
		if (KNOWN_LOCATIONS.has(word)) return 'location';
	}
	return 'topic';
}

/**
 * Order phrases for natural reading: person → org → location → topic
 */
function orderPhrases(phrases: string[]): string[] {
	const typeOrder = { person: 0, org: 1, location: 2, topic: 3 };
	return [...phrases].sort((a, b) => {
		const typeA = getPhraseType(a);
		const typeB = getPhraseType(b);
		return typeOrder[typeA] - typeOrder[typeB];
	});
}

/**
 * Combine related phrases into a richer topic name
 * Limits to 3-4 words for readability
 */
function combinePhrases(phrases: string[]): string {
	if (phrases.length === 0) return '';
	if (phrases.length === 1) return phrases[0];

	// Order by type for natural reading
	const ordered = orderPhrases(phrases);

	// Combine, avoiding redundant words
	const usedWords = new Set<string>();
	const resultParts: string[] = [];

	for (const phrase of ordered) {
		const words = phrase.split(' ');
		const newWords = words.filter(w => !usedWords.has(w.toLowerCase()));

		if (newWords.length > 0) {
			resultParts.push(newWords.join(' '));
			newWords.forEach(w => usedWords.add(w.toLowerCase()));
		}

		// Limit total words to 4
		if (usedWords.size >= 4) break;
	}

	return resultParts.join(' ');
}

/**
 * Find phrase clusters with high co-occurrence (appear in same articles)
 * Returns groups of related phrases that should be combined
 */
function findPhraseClusters(
	phraseData: Map<string, {
		displayName: string;
		mentions: number;
		sources: Set<string>;
		tiers: Set<'fringe' | 'alternative' | 'mainstream'>;
		firstSeen: Date;
		lastSeen: Date;
		items: NewsItem[];
	}>
): Map<string, Set<string>> {
	// Build article sets for each phrase
	const phraseArticles = new Map<string, Set<string>>();
	for (const [key, data] of phraseData) {
		phraseArticles.set(key, new Set(data.items.map(item => item.id)));
	}

	// Find phrases with high overlap (>50% of smaller set)
	const clusters = new Map<string, Set<string>>();
	const phraseKeys = Array.from(phraseData.keys());

	for (let i = 0; i < phraseKeys.length; i++) {
		const keyA = phraseKeys[i];
		const articlesA = phraseArticles.get(keyA)!;
		if (articlesA.size < 2) continue; // Need at least 2 articles

		for (let j = i + 1; j < phraseKeys.length; j++) {
			const keyB = phraseKeys[j];
			const articlesB = phraseArticles.get(keyB)!;
			if (articlesB.size < 2) continue;

			// Calculate overlap
			const intersection = new Set([...articlesA].filter(x => articlesB.has(x)));
			const smallerSize = Math.min(articlesA.size, articlesB.size);
			const overlapRatio = intersection.size / smallerSize;

			// High overlap = related phrases (40% threshold to catch more stable narrative combinations)
			if (overlapRatio >= 0.4 && intersection.size >= 2) {
				// Add to cluster
				if (!clusters.has(keyA)) clusters.set(keyA, new Set([keyA]));
				if (!clusters.has(keyB)) clusters.set(keyB, new Set([keyB]));
				clusters.get(keyA)!.add(keyB);
				clusters.get(keyB)!.add(keyA);
			}
		}
	}

	return clusters;
}

/**
 * Merge clustered phrases into combined narratives
 */
function mergeClusteredPhrases(
	phraseData: Map<string, {
		displayName: string;
		mentions: number;
		sources: Set<string>;
		tiers: Set<'fringe' | 'alternative' | 'mainstream'>;
		firstSeen: Date;
		lastSeen: Date;
		items: NewsItem[];
	}>,
	clusters: Map<string, Set<string>>
): Map<string, {
	displayName: string;
	mentions: number;
	sources: Set<string>;
	tiers: Set<'fringe' | 'alternative' | 'mainstream'>;
	firstSeen: Date;
	lastSeen: Date;
	items: NewsItem[];
}> {
	// Track which phrases have been merged
	const merged = new Set<string>();
	const result = new Map<string, typeof phraseData extends Map<string, infer V> ? V : never>();

	// Process clusters - merge related phrases
	for (const [key, relatedKeys] of clusters) {
		if (merged.has(key)) continue;
		if (relatedKeys.size <= 1) continue; // No cluster

		// Get all phrases in this cluster
		const clusterPhrases = Array.from(relatedKeys)
			.filter(k => phraseData.has(k) && !merged.has(k))
			.map(k => ({ key: k, data: phraseData.get(k)! }))
			.sort((a, b) => b.data.mentions - a.data.mentions); // Sort by mentions

		if (clusterPhrases.length < 2) continue;

		// Take top 3 phrases by mentions
		const topPhrases = clusterPhrases.slice(0, 3);
		const displayNames = topPhrases.map(p => p.data.displayName);

		// Create combined topic
		const combinedTopic = combinePhrases(displayNames);

		// Merge data from all phrases in cluster
		const allSources = new Set<string>();
		const allTiers = new Set<'fringe' | 'alternative' | 'mainstream'>();
		const allItems: NewsItem[] = [];
		let firstSeen = topPhrases[0].data.firstSeen;
		let lastSeen = topPhrases[0].data.lastSeen;
		let totalMentions = 0;

		for (const { key: pKey, data } of topPhrases) {
			data.sources.forEach(s => allSources.add(s));
			data.tiers.forEach(t => allTiers.add(t));
			allItems.push(...data.items);
			if (data.firstSeen < firstSeen) firstSeen = data.firstSeen;
			if (data.lastSeen > lastSeen) lastSeen = data.lastSeen;
			totalMentions += data.mentions;
			merged.add(pKey);
		}

		// Dedupe items
		const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());

		result.set(combinedTopic.toLowerCase(), {
			displayName: combinedTopic,
			mentions: totalMentions,
			sources: allSources,
			tiers: allTiers,
			firstSeen,
			lastSeen,
			items: uniqueItems
		});
	}

	// Add non-clustered phrases
	for (const [key, data] of phraseData) {
		if (!merged.has(key)) {
			result.set(key, data);
		}
	}

	return result;
}

/**
 * Enrich single-word topics with context from headlines
 * Ensures all topics have at least 2 words for better context
 */
function enrichSingleWordTopic(topic: string, items: NewsItem[]): string {
	// If already multi-word, return as-is
	if (topic.includes(' ')) {
		return topic;
	}

	const topicLower = topic.toLowerCase();

	// Try to find a context word from headlines
	for (const item of items.slice(0, 5)) {
		const words = item.title.split(/\s+/);

		// Find the topic word position
		const topicIndex = words.findIndex(
			(w) => w.toLowerCase().replace(/[^a-z]/g, '') === topicLower
		);

		if (topicIndex !== -1) {
			// Look for adjacent meaningful words
			// Check word after topic
			if (topicIndex + 1 < words.length) {
				const nextWord = words[topicIndex + 1].replace(/[^a-zA-Z]/g, '');
				if (nextWord.length >= 3 && !COMMON_WORDS.has(nextWord.toLowerCase())) {
					return `${topic} ${nextWord}`;
				}
			}

			// Check word before topic
			if (topicIndex > 0) {
				const prevWord = words[topicIndex - 1].replace(/[^a-zA-Z]/g, '');
				if (prevWord.length >= 3 && !COMMON_WORDS.has(prevWord.toLowerCase())) {
					return `${prevWord} ${topic}`;
				}
			}
		}
	}

	// Fallback: find any proper noun in headlines that's not the topic
	for (const item of items.slice(0, 3)) {
		const words = item.title.split(/\s+/);
		for (let i = 1; i < words.length; i++) {
			const word = words[i].replace(/[^a-zA-Z]/g, '');
			if (
				word.length >= 4 &&
				/^[A-Z][a-z]+/.test(word) &&
				word.toLowerCase() !== topicLower &&
				!COMMON_WORDS.has(word.toLowerCase())
			) {
				// Determine order based on phrase type
				const topicType = getPhraseType(topic);
				const contextType = getPhraseType(word);
				const typeOrder = { person: 0, org: 1, location: 2, topic: 3 };

				if (typeOrder[contextType] < typeOrder[topicType]) {
					return `${word} ${topic}`;
				} else {
					return `${topic} ${word}`;
				}
			}
		}
	}

	// Last resort: add category based on phrase type
	const phraseType = getPhraseType(topic);
	switch (phraseType) {
		case 'person':
			return `${topic} News`;
		case 'org':
			return `${topic} Update`;
		case 'location':
			return `${topic} Developments`;
		default:
			return `${topic} Story`;
	}
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

	// Find and merge clustered phrases for richer topics
	const clusters = findPhraseClusters(phraseData);
	const mergedPhraseData = mergeClusteredPhrases(phraseData, clusters);

	// Convert to narratives
	const narratives: Narrative[] = [];

	for (const [key, data] of mergedPhraseData) {
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

		// Ensure topic has at least 2 words for better context
		const enrichedTopic = enrichSingleWordTopic(data.displayName, sortedItems);

		narratives.push({
			id: generateId(),
			topic: enrichedTopic,
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

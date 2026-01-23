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
 * Generic phrases to filter out - common news/business terms that aren't narratives
 */
const BLOCKED_PHRASES = new Set([
	// Generic business terms
	'joint venture',
	'press release',
	'board directors',
	'chief executive',
	'executive officer',
	'annual report',
	'fiscal year',
	'quarter results',
	'earnings report',
	'stock market',
	'market share',
	'private equity',
	'venture capital',
	'initial public',
	'public offering',
	// Generic government/politics
	'united states',
	'white house',
	'supreme court',
	'federal reserve',
	'central bank',
	'bank japan',
	'bank england',
	'european union',
	'european central',
	'prime minister',
	'foreign minister',
	'defense minister',
	'finance minister',
	// Generic news phrases
	'breaking news',
	'latest news',
	'news update',
	'developing story',
	'reports say',
	'sources say',
	'according sources',
	'official says',
	'officials say',
	'government says',
	'statement says',
	'spokesman says',
	'spokesperson says',
	// Time references
	'last week',
	'last month',
	'last year',
	'next week',
	'next month',
	'next year',
	'this week',
	'this month',
	'this year',
	// Generic locations without context
	'north america',
	'south america',
	'middle east',
	'asia pacific',
	'east asia',
	'south asia',
	'west africa',
	'east africa',
	// Other generic
	'million dollars',
	'billion dollars',
	'percent increase',
	'percent decrease',
	'year over',
	'over year',
	'quarter over',
	'month over',
	'record high',
	'record low',
	'all time',
	'first time',
	'long term',
	'short term',
	'real estate',
	'social media',
	'artificial intelligence', // too broad
	'climate change', // too broad unless specific
	'public health',
	'national security',
	'economic growth',
	'interest rates',
	'inflation rate',
	'unemployment rate',
	'gross domestic',
	'domestic product',
	'board peace', // specific garbage we've seen
	// Partial phrases / fragments
	'judge rejects',
	'judge rules',
	'court rules',
	'court rejects',
	'report says',
	'study finds',
	'study shows',
	'research shows',
	'poll shows',
	'survey shows',
	'data shows',
	'experts say',
	'analysts say',
	// Redundant event names (keep full names only)
	'world economic',
	'economic forum',
	'world forum',
	'davos forum',
	'general assembly',
	'security council',
	// More generic terms
	'global economy',
	'world economy',
	'stock exchange',
	'wall street',
	'tech companies',
	'tech industry',
	'oil prices',
	'gas prices',
	'energy prices',
	'food prices'
]);

/**
 * Check if a phrase should be blocked
 */
function isBlockedPhrase(phrase: string): boolean {
	return BLOCKED_PHRASES.has(phrase.toLowerCase());
}

/**
 * Check if word is significant (not a stop word or technical artifact)
 */
function isSignificantWord(word: string): boolean {
	const stopWords = new Set([
		// Common stop words
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
		'those',
		// HTML/URL artifacts that leak through from RSS descriptions
		'href',
		'https',
		'http',
		'www',
		'html',
		'link',
		'click',
		'here',
		'read',
		'more',
		'span',
		'class',
		'style',
		'width',
		'height',
		'target',
		'blank',
		'noopener',
		'noreferrer',
		'continue',
		'reading',
		'article',
		'source',
		'image',
		'video',
		'photo',
		'caption',
		'embed',
		'iframe'
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
			// Skip blocked generic phrases
			if (isBlockedPhrase(phrase)) continue;
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

		// Skip if phrase is too short or too generic
		const words = phrase.split(' ');
		if (words.length < 2) continue;
		if (words.every(w => w.length <= 4)) continue; // All short words = likely garbage

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
			topic: phrase,
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

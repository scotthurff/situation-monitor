/**
 * Correlation Analysis - Detect patterns across news items
 */

import type { NewsItem, Correlation } from '$lib/types';
import { generateId } from '$lib/utils';

/**
 * Correlation topics to detect
 */
const CORRELATION_TOPICS = [
	{
		id: 'military-tension',
		name: 'Military Tension',
		keywords: ['military', 'troops', 'deployment', 'missile', 'naval', 'air force', 'defense'],
		severity: 'high' as const
	},
	{
		id: 'economic-crisis',
		name: 'Economic Crisis',
		keywords: ['recession', 'crash', 'inflation', 'unemployment', 'default', 'bailout', 'bank run'],
		severity: 'critical' as const
	},
	{
		id: 'cyber-threat',
		name: 'Cyber Threat',
		keywords: ['cyberattack', 'hack', 'breach', 'ransomware', 'malware', 'vulnerability'],
		severity: 'high' as const
	},
	{
		id: 'geopolitical-shift',
		name: 'Geopolitical Shift',
		keywords: ['sanctions', 'embargo', 'alliance', 'treaty', 'diplomatic', 'summit'],
		severity: 'medium' as const
	},
	{
		id: 'market-volatility',
		name: 'Market Volatility',
		keywords: ['volatility', 'selloff', 'correction', 'circuit breaker', 'trading halt'],
		severity: 'high' as const
	},
	{
		id: 'energy-crisis',
		name: 'Energy Crisis',
		keywords: ['oil', 'gas', 'opec', 'pipeline', 'energy', 'blackout', 'grid'],
		severity: 'medium' as const
	},
	{
		id: 'political-instability',
		name: 'Political Instability',
		keywords: ['protest', 'coup', 'resignation', 'impeachment', 'election', 'unrest'],
		severity: 'high' as const
	},
	{
		id: 'tech-disruption',
		name: 'Tech Disruption',
		keywords: ['ai', 'artificial intelligence', 'regulation', 'antitrust', 'breakthrough'],
		severity: 'medium' as const
	}
];

/**
 * Calculate keyword match score for an item
 */
function calculateMatchScore(item: NewsItem, keywords: string[]): number {
	const text = `${item.title} ${item.description || ''}`.toLowerCase();
	let score = 0;

	for (const keyword of keywords) {
		if (text.includes(keyword.toLowerCase())) {
			score++;
		}
	}

	return score;
}

/**
 * Find correlations across news items
 */
export function detectCorrelations(
	items: NewsItem[],
	minItems = 3,
	minConfidence = 0.5
): Correlation[] {
	const correlations: Correlation[] = [];

	for (const topic of CORRELATION_TOPICS) {
		const matchingItems: Array<{ item: NewsItem; score: number }> = [];

		// Score each item against the topic
		for (const item of items) {
			const score = calculateMatchScore(item, topic.keywords);
			if (score >= 2) {
				// Require at least 2 keyword matches
				matchingItems.push({ item, score });
			}
		}

		// Only create correlation if enough items match
		if (matchingItems.length >= minItems) {
			// Sort by score and take top matches
			matchingItems.sort((a, b) => b.score - a.score);
			const topItems = matchingItems.slice(0, 10);

			// Calculate confidence based on score distribution
			const avgScore = topItems.reduce((sum, m) => sum + m.score, 0) / topItems.length;
			const confidence = Math.min(1, avgScore / topic.keywords.length);

			if (confidence >= minConfidence) {
				correlations.push({
					id: generateId(),
					topic: topic.name,
					items: topItems.map((m) => m.item),
					severity: topic.severity,
					confidence,
					detectedAt: new Date()
				});
			}
		}
	}

	// Sort by severity and confidence
	const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
	correlations.sort((a, b) => {
		const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
		if (severityDiff !== 0) return severityDiff;
		return b.confidence - a.confidence;
	});

	return correlations;
}

/**
 * Find correlations between specific sources
 */
export function detectCrossSourceCorrelations(items: NewsItem[]): Correlation[] {
	// Group items by source
	const bySource = new Map<string, NewsItem[]>();
	for (const item of items) {
		const list = bySource.get(item.source) || [];
		list.push(item);
		bySource.set(item.source, list);
	}

	// Find topics mentioned across multiple sources
	const correlations: Correlation[] = [];
	const sources = Array.from(bySource.keys());

	if (sources.length < 2) return correlations;

	// Simple word extraction for correlation - require 5+ chars for more meaningful words
	const extractKeywords = (text: string): Set<string> => {
		const words = text.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
		return new Set(words.filter((w) => !STOP_WORDS.has(w)));
	};

	// Find common keywords across sources
	const sourceKeywords = new Map<string, Map<string, NewsItem[]>>();
	for (const [source, sourceItems] of bySource) {
		const kwMap = new Map<string, NewsItem[]>();
		for (const item of sourceItems) {
			const keywords = extractKeywords(`${item.title} ${item.description || ''}`);
			for (const kw of keywords) {
				const list = kwMap.get(kw) || [];
				list.push(item);
				kwMap.set(kw, list);
			}
		}
		sourceKeywords.set(source, kwMap);
	}

	// Find keywords present in multiple sources
	const keywordSources = new Map<string, Set<string>>();
	for (const [source, kwMap] of sourceKeywords) {
		for (const kw of kwMap.keys()) {
			const set = keywordSources.get(kw) || new Set();
			set.add(source);
			keywordSources.set(kw, set);
		}
	}

	// Create correlations for keywords in 4+ sources for more meaningful patterns
	for (const [keyword, sourcesSet] of keywordSources) {
		if (sourcesSet.size >= 4) {
			const relatedItems: NewsItem[] = [];
			for (const source of sourcesSet) {
				const kwMap = sourceKeywords.get(source);
				const items = kwMap?.get(keyword) || [];
				relatedItems.push(...items.slice(0, 2));
			}

			if (relatedItems.length >= 3) {
				const richTopic = buildCrossSourceTopic(keyword, relatedItems);
				correlations.push({
					id: generateId(),
					topic: richTopic,
					items: relatedItems.slice(0, 10),
					severity: 'medium',
					confidence: sourcesSet.size / sources.length,
					detectedAt: new Date()
				});
			}
		}
	}

	return correlations.slice(0, 5);
}

// Common stop words to filter out - expanded list to avoid meaningless correlations
const STOP_WORDS = new Set([
	// Basic articles, conjunctions, prepositions
	'the',
	'and',
	'for',
	'are',
	'but',
	'not',
	'you',
	'all',
	'can',
	'her',
	'was',
	'one',
	'our',
	'out',
	'get',
	'has',
	'him',
	'his',
	'how',
	'its',
	'may',
	'now',
	'see',
	'way',
	'who',
	'did',
	'own',
	'say',
	'she',
	'too',
	'use',
	'your',
	'each',
	'make',
	'like',
	'back',
	'only',
	'come',
	'over',
	'such',
	'than',
	'into',
	'some',
	'them',
	'very',
	'when',
	'from',
	'they',
	'been',
	'have',
	'many',
	'said',
	'with',
	'this',
	'that',
	'will',
	'what',
	'were',
	'there',
	'their',
	'which',
	'would',
	'could',
	'about',
	'other',
	'after',
	// Common verbs and auxiliaries
	'should',
	'being',
	'those',
	'where',
	'while',
	'these',
	'before',
	'might',
	'having',
	'doing',
	'going',
	'getting',
	'making',
	'saying',
	'taking',
	'coming',
	'looking',
	'using',
	'trying',
	'calling',
	'working',
	'telling',
	'asking',
	'needing',
	'seeming',
	'leaving',
	'putting',
	'meaning',
	'keeping',
	'letting',
	'beginning',
	'showing',
	'hearing',
	'playing',
	'running',
	'moving',
	'living',
	'believing',
	'bringing',
	'happening',
	'writing',
	'sitting',
	'standing',
	'losing',
	'paying',
	'meeting',
	'including',
	'continuing',
	'setting',
	'learning',
	'changing',
	'leading',
	'understanding',
	'watching',
	'following',
	'stopping',
	'creating',
	'speaking',
	'reading',
	'allowing',
	'adding',
	'spending',
	'growing',
	'opening',
	'walking',
	'winning',
	'offering',
	'remembering',
	'loving',
	'considering',
	'appearing',
	'buying',
	'waiting',
	'serving',
	'dying',
	'sending',
	'expecting',
	'building',
	'staying',
	'falling',
	'cutting',
	'reaching',
	'killing',
	'remaining',
	'suggesting',
	'raising',
	'passing',
	'selling',
	'requiring',
	'reporting',
	'deciding',
	'pulling',
	// Common adverbs and modifiers
	'here',
	'just',
	'more',
	'most',
	'also',
	'then',
	'well',
	'even',
	'still',
	'already',
	'almost',
	'often',
	'really',
	'actually',
	'always',
	'never',
	'again',
	'much',
	'another',
	'around',
	'every',
	'first',
	'last',
	'long',
	'great',
	'little',
	'good',
	'right',
	'high',
	'different',
	'small',
	'large',
	'next',
	'early',
	'young',
	'important',
	'public',
	'possible',
	'able',
	'likely',
	'certain',
	'real',
	'full',
	'sure',
	'better',
	'best',
	'free',
	'clear',
	'special',
	'hard',
	'whole',
	'away',
	'second',
	'later',
	'least',
	'enough',
	'both',
	'less',
	'either',
	'recent',
	'perhaps',
	'maybe',
	// Common nouns that don't indicate patterns
	'people',
	'year',
	'years',
	'time',
	'times',
	'thing',
	'things',
	'part',
	'place',
	'case',
	'week',
	'weeks',
	'company',
	'system',
	'program',
	'question',
	'work',
	'government',
	'number',
	'night',
	'point',
	'home',
	'water',
	'room',
	'mother',
	'area',
	'money',
	'story',
	'fact',
	'month',
	'months',
	'side',
	'kind',
	'head',
	'house',
	'service',
	'friend',
	'father',
	'power',
	'hour',
	'hours',
	'game',
	'line',
	'member',
	'city',
	'community',
	'name',
	'president',
	'team',
	'minute',
	'minutes',
	'idea',
	'body',
	'information',
	'word',
	'words',
	'family',
	'matter',
	'group',
	'center',
	'development',
	'problem',
	'problems',
	'hand',
	'hands',
	'course',
	'days',
	'today',
	'policy',
	'office',
	'woman',
	'women',
	'life',
	'level',
	'child',
	'children',
	'example',
	'paper',
	'media',
	'food',
	'history',
	'result',
	'results',
	'change',
	'reason',
	'research',
	'girl',
	'guys',
	'moment',
	'teacher',
	'force',
	'education',
	'person',
	'country',
	'countries',
	'state',
	'states',
	'news',
	'report',
	'world',
	'officials',
	'official',
	'according',
	'sources',
	'source',
	'says',
	'told',
	'statement',
	'spokesman',
	'spokesperson',
	// URL/tech noise
	'https',
	'http',
	'www',
	'com',
	'org',
	'net',
	'html',
	'index',
	'article',
	'posts',
	'update',
	'updates',
	'breaking',
	'latest',
	'watch',
	'video',
	'photos',
	'click',
	'share',
	'subscribe',
	'newsletter'
]);

/**
 * Extract proper nouns (entities) from headlines
 * Finds capitalized words that aren't at sentence start
 */
function extractProperNouns(text: string): string[] {
	const words = text.split(/\s+/);
	const properNouns: string[] = [];

	for (let i = 1; i < words.length; i++) {
		const word = words[i].replace(/[^a-zA-Z]/g, '');
		if (word.length >= 3 && /^[A-Z][a-z]+/.test(word)) {
			if (!STOP_WORDS.has(word.toLowerCase())) {
				properNouns.push(word);
			}
		}
	}
	return properNouns;
}

/**
 * Build richer topic from keyword and related items
 * Always returns at least 2 words for context
 */
function buildCrossSourceTopic(keyword: string, items: NewsItem[]): string {
	const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);

	// Count proper nouns across all items
	const nounCounts = new Map<string, number>();

	for (const item of items) {
		const nouns = extractProperNouns(item.title);
		for (const noun of nouns) {
			if (noun.toLowerCase() !== keyword) {
				nounCounts.set(noun, (nounCounts.get(noun) || 0) + 1);
			}
		}
	}

	// Find most common proper noun (must appear in 2+ items)
	let topEntity = '';
	let topCount = 0;
	for (const [noun, count] of nounCounts) {
		if (count >= 2 && count > topCount) {
			topEntity = noun;
			topCount = count;
		}
	}

	// If found a top entity, combine with keyword
	if (topEntity) {
		return `${topEntity} ${capitalizedKeyword}`;
	}

	// Fallback: find ANY proper noun from the first few items
	for (const item of items.slice(0, 3)) {
		const nouns = extractProperNouns(item.title);
		if (nouns.length > 0 && nouns[0].toLowerCase() !== keyword) {
			return `${nouns[0]} ${capitalizedKeyword}`;
		}
	}

	// Last resort: extract a context word from headlines
	// Look for capitalized words at start of headlines too
	for (const item of items.slice(0, 3)) {
		const words = item.title.split(/\s+/);
		for (const word of words) {
			const cleaned = word.replace(/[^a-zA-Z]/g, '');
			if (
				cleaned.length >= 4 &&
				/^[A-Z][a-z]+/.test(cleaned) &&
				cleaned.toLowerCase() !== keyword &&
				!STOP_WORDS.has(cleaned.toLowerCase())
			) {
				return `${cleaned} ${capitalizedKeyword}`;
			}
		}
	}

	// Absolute fallback: use "Global" as generic context
	return `Global ${capitalizedKeyword}`;
}

/**
 * Keyword configuration for news analysis and alerting
 *
 * Expanded for comprehensive US politics, legal, immigration, and macro tracking
 */

/**
 * Alert-triggering keywords - these indicate potentially significant events
 */
export const ALERT_KEYWORDS = {
	critical: [
		// Conflict & Security
		'nuclear', 'missile launch', 'invasion', 'declaration of war', 'martial law',
		'terrorist attack', 'assassination', 'coup', 'state of emergency',
		// Economic Crisis
		'bank run', 'currency collapse', 'default', 'hyperinflation', 'debt ceiling breach',
		// Natural Disasters
		'earthquake', 'tsunami', 'eruption', 'pandemic declared',
		// Cyber
		'cyberattack', 'infrastructure attack', 'grid down',
		// US Politics - Critical
		'constitutional crisis', 'presidential removal', '25th amendment invoked',
		'supreme court overturns', 'martial law', 'insurrection act',
		// Legal - Critical
		'chief justice', 'landmark ruling', 'scotus overturns precedent'
	],
	high: [
		// Geopolitical
		'sanctions', 'embargo', 'military buildup', 'border clash', 'mobilization',
		'diplomatic crisis', 'expelled diplomats', 'recalled ambassador',
		// Economic
		'rate hike', 'rate cut', 'bailout', 'stimulus', 'recession',
		'market crash', 'circuit breaker', 'trading halt', 'yield curve inversion',
		'fed emergency', 'fomc statement', 'quantitative tightening',
		// Tech
		'data breach', 'zero-day', 'ransomware', 'outage',
		// US Politics - High
		'impeachment', 'resignation', 'election fraud', 'protests',
		'articles of impeachment', 'special counsel', 'indictment',
		'supreme court decision', 'cert granted', 'emergency stay',
		'executive order signed', 'veto override', 'government shutdown',
		// Immigration - High
		'mass deportation', 'ice raid', 'border emergency', 'detention facility',
		'asylum policy change', 'remain in mexico', 'title 42', 'parole program',
		// Legal - High
		'federal judge blocks', 'injunction granted', 'appeal filed',
		'oral arguments', 'unanimous decision', 'dissenting opinion'
	],
	medium: [
		// Economic
		'inflation', 'unemployment', 'gdp', 'earnings miss', 'layoffs',
		'merger', 'acquisition', 'ipo', 'cpi release', 'jobs report',
		'jobless claims', 'retail sales', 'housing starts', 'pce data',
		'treasury auction', 'fed minutes', 'beige book',
		// Political
		'executive order', 'legislation', 'veto', 'filibuster',
		'polling', 'approval rating', 'confirmation hearing',
		'committee vote', 'floor vote', 'cloture motion',
		'bill introduced', 'bill passed', 'sent to president',
		// Tech
		'ai regulation', 'antitrust', 'privacy', 'security flaw',
		// Markets
		'volatility', 'correction', 'rally', 'selloff',
		// Immigration - Medium
		'border crossing', 'deportation', 'visa policy', 'asylum',
		'work permit', 'daca', 'tps', 'h1b', 'green card',
		// Legal - Medium
		'lawsuit filed', 'class action', 'settlement', 'verdict',
		'appeals court', 'district court', 'en banc', 'remanded'
	]
} as const;

/**
 * Region detection keywords
 */
export const REGION_KEYWORDS: Record<string, string[]> = {
	'North America': ['united states', 'usa', 'america', 'canada', 'mexico', 'washington', 'white house', 'congress', 'fed', 'federal reserve'],
	'Europe': ['european union', 'eu', 'nato', 'uk', 'britain', 'germany', 'france', 'brussels', 'london', 'berlin', 'paris', 'ecb'],
	'Asia Pacific': ['china', 'japan', 'korea', 'taiwan', 'india', 'australia', 'asean', 'beijing', 'tokyo', 'seoul', 'taipei'],
	'Middle East': ['iran', 'israel', 'saudi', 'uae', 'qatar', 'syria', 'iraq', 'gaza', 'west bank', 'jerusalem', 'tehran', 'riyadh'],
	'Russia/CIS': ['russia', 'ukraine', 'moscow', 'kremlin', 'putin', 'kyiv', 'belarus', 'kazakhstan'],
	'Africa': ['africa', 'nigeria', 'south africa', 'kenya', 'egypt', 'ethiopia', 'african union'],
	'Latin America': ['brazil', 'argentina', 'chile', 'colombia', 'venezuela', 'peru', 'mercosur']
};

/**
 * Topic detection keywords
 */
export const TOPIC_KEYWORDS: Record<string, string[]> = {
	'Military & Defense': ['military', 'defense', 'army', 'navy', 'air force', 'pentagon', 'troops', 'weapons', 'missile', 'aircraft', 'submarine', 'drone'],
	'Economy & Markets': ['economy', 'market', 'stock', 'bond', 'treasury', 'inflation', 'gdp', 'unemployment', 'trade', 'tariff', 'fiscal', 'monetary'],
	'Technology': ['technology', 'tech', 'ai', 'artificial intelligence', 'software', 'hardware', 'startup', 'silicon valley', 'semiconductor', 'chip'],
	'Cybersecurity': ['cyber', 'hack', 'breach', 'malware', 'ransomware', 'vulnerability', 'exploit', 'security', 'encryption'],
	'Energy': ['oil', 'gas', 'energy', 'opec', 'renewable', 'solar', 'wind', 'nuclear power', 'pipeline', 'electricity', 'grid'],
	'Climate': ['climate', 'carbon', 'emissions', 'global warming', 'weather', 'hurricane', 'wildfire', 'drought', 'flood'],
	'Politics': ['election', 'vote', 'congress', 'parliament', 'president', 'prime minister', 'legislation', 'policy', 'democrat', 'republican'],
	'Finance': ['bank', 'fed', 'central bank', 'interest rate', 'loan', 'credit', 'debt', 'mortgage', 'investment', 'hedge fund'],
	'Healthcare': ['health', 'medical', 'hospital', 'vaccine', 'fda', 'drug', 'pharmaceutical', 'covid', 'disease', 'outbreak'],
	'Space': ['space', 'nasa', 'spacex', 'satellite', 'rocket', 'orbit', 'moon', 'mars', 'astronaut'],

	// NEW: Expanded US Politics topics
	'Congress': ['congress', 'senate', 'house', 'representative', 'senator', 'speaker', 'majority leader', 'minority leader', 'committee', 'hearing', 'subpoena', 'testimony', 'floor vote', 'cloture', 'filibuster'],
	'Executive Branch': ['white house', 'oval office', 'executive order', 'presidential', 'cabinet', 'administration', 'executive action', 'proclamation', 'directive', 'biden', 'trump'],
	'Elections': ['election', 'campaign', 'primary', 'caucus', 'ballot', 'voting', 'electoral college', 'swing state', 'battleground', 'poll', 'nominee', 'candidate', 'fundraising', 'super pac', 'donor'],

	// NEW: Legal & Courts
	'Supreme Court': ['supreme court', 'scotus', 'chief justice', 'justice', 'oral argument', 'cert', 'certiorari', 'amicus', 'brief', 'opinion', 'dissent', 'concurrence', 'precedent', 'stare decisis'],
	'Federal Courts': ['federal court', 'district court', 'appeals court', 'circuit court', 'judge', 'ruling', 'injunction', 'stay', 'appeal', 'motion', 'docket', 'plaintiff', 'defendant', 'litigation'],
	'Criminal Justice': ['indictment', 'prosecution', 'doj', 'fbi', 'attorney general', 'special counsel', 'grand jury', 'plea', 'conviction', 'sentence', 'pardon', 'commutation'],

	// NEW: Immigration & Border
	'Immigration': ['immigration', 'immigrant', 'visa', 'green card', 'naturalization', 'asylum', 'refugee', 'undocumented', 'unauthorized', 'legal status', 'work permit', 'daca', 'dreamer', 'tps'],
	'Border Enforcement': ['border', 'ice', 'cbp', 'deportation', 'removal', 'detention', 'enforcement', 'raid', 'arrest', 'apprehension', 'encounter', 'crossing', 'migrant', 'border patrol', 'port of entry'],

	// NEW: Macro & Fed
	'Federal Reserve': ['federal reserve', 'fed', 'fomc', 'powell', 'rate decision', 'monetary policy', 'quantitative easing', 'qe', 'qt', 'balance sheet', 'dot plot', 'fed funds', 'reserve', 'liquidity'],
	'Inflation & Prices': ['inflation', 'cpi', 'pce', 'core inflation', 'price index', 'deflation', 'disinflation', 'sticky inflation', 'transitory', 'cost of living'],
	'Employment': ['employment', 'unemployment', 'jobs report', 'nonfarm payrolls', 'jobless claims', 'labor market', 'hiring', 'layoffs', 'jolts', 'quit rate', 'wage growth', 'participation rate'],
	'Treasury & Debt': ['treasury', 'bonds', 'yield', 'yield curve', 'auction', 'debt ceiling', 'national debt', 'deficit', 'fiscal', 't-bill', 't-note', 't-bond', 'sovereign debt'],
	'GDP & Growth': ['gdp', 'economic growth', 'recession', 'expansion', 'contraction', 'gdp growth', 'real gdp', 'nominal gdp', 'economic activity', 'industrial production']
};

/**
 * Political figure detection - key figures to track
 */
export const POLITICAL_FIGURES: Record<string, { role: string; party?: string; aliases?: string[] }> = {
	// Executive Branch
	'Joe Biden': { role: 'President', party: 'D', aliases: ['biden', 'president biden'] },
	'Kamala Harris': { role: 'Vice President', party: 'D', aliases: ['harris', 'vp harris'] },
	'Donald Trump': { role: 'Former President', party: 'R', aliases: ['trump', 'president trump'] },

	// Congressional Leadership
	'Mike Johnson': { role: 'Speaker of the House', party: 'R', aliases: ['speaker johnson'] },
	'Chuck Schumer': { role: 'Senate Majority Leader', party: 'D', aliases: ['schumer'] },
	'Mitch McConnell': { role: 'Senate Minority Leader', party: 'R', aliases: ['mcconnell'] },
	'Hakeem Jeffries': { role: 'House Minority Leader', party: 'D', aliases: ['jeffries'] },

	// Key Cabinet
	'Janet Yellen': { role: 'Treasury Secretary', party: 'D', aliases: ['yellen', 'secretary yellen'] },
	'Antony Blinken': { role: 'Secretary of State', party: 'D', aliases: ['blinken'] },
	'Merrick Garland': { role: 'Attorney General', party: 'D', aliases: ['garland', 'ag garland'] },
	'Alejandro Mayorkas': { role: 'DHS Secretary', party: 'D', aliases: ['mayorkas'] },

	// Fed
	'Jerome Powell': { role: 'Fed Chair', aliases: ['powell', 'chair powell', 'fed chair'] },

	// Supreme Court
	'John Roberts': { role: 'Chief Justice', aliases: ['roberts', 'chief justice roberts'] },
	'Clarence Thomas': { role: 'Associate Justice', aliases: ['thomas', 'justice thomas'] },
	'Samuel Alito': { role: 'Associate Justice', aliases: ['alito', 'justice alito'] },
	'Sonia Sotomayor': { role: 'Associate Justice', aliases: ['sotomayor', 'justice sotomayor'] },
	'Elena Kagan': { role: 'Associate Justice', aliases: ['kagan', 'justice kagan'] },
	'Neil Gorsuch': { role: 'Associate Justice', aliases: ['gorsuch', 'justice gorsuch'] },
	'Brett Kavanaugh': { role: 'Associate Justice', aliases: ['kavanaugh', 'justice kavanaugh'] },
	'Amy Coney Barrett': { role: 'Associate Justice', aliases: ['barrett', 'justice barrett', 'acb'] },
	'Ketanji Brown Jackson': { role: 'Associate Justice', aliases: ['jackson', 'justice jackson', 'kbj'] }
};

/**
 * Legal case keywords for significance detection
 */
export const LEGAL_KEYWORDS = {
	landmark: [
		'overturns', 'overrules', 'reverses precedent', 'constitutional',
		'first amendment', 'second amendment', 'fourth amendment', 'fifth amendment',
		'fourteenth amendment', 'due process', 'equal protection', 'commerce clause',
		'separation of powers', 'executive privilege', 'presidential immunity'
	],
	major: [
		'certiorari granted', 'cert granted', 'en banc', 'unanimous',
		'class action', 'nationwide injunction', 'preliminary injunction',
		'permanent injunction', 'emergency stay', 'shadow docket'
	],
	notable: [
		'appeals court', 'circuit court', 'district court',
		'summary judgment', 'motion to dismiss', 'discovery',
		'settlement', 'consent decree'
	]
};

/**
 * Immigration enforcement keywords
 */
export const IMMIGRATION_KEYWORDS = {
	enforcement: [
		'ice', 'cbp', 'deportation', 'removal', 'detention', 'raid',
		'arrest', 'apprehension', 'enforcement action', 'sensitive location',
		'worksite enforcement', 'fugitive operations', 'ero', 'hsi'
	],
	policy: [
		'asylum', 'refugee', 'parole', 'tps', 'daca', 'dreamer',
		'visa', 'green card', 'naturalization', 'expedited removal',
		'credible fear', 'mppp', 'remain in mexico', 'title 42', 'title 8',
		'public charge', 'inadmissibility', 'unlawful presence'
	],
	border: [
		'border', 'port of entry', 'crossing', 'encounter', 'gotaway',
		'sector', 'checkpoint', 'smuggling', 'trafficking', 'cartel',
		'unaccompanied minor', 'family unit', 'single adult'
	]
};

/**
 * Sentiment indicators
 */
export const SENTIMENT_KEYWORDS = {
	positive: [
		'surge', 'soar', 'rally', 'gain', 'growth', 'boom', 'record high',
		'breakthrough', 'success', 'victory', 'agreement', 'peace', 'deal',
		'approved', 'launched', 'upgraded', 'strong', 'exceeded expectations'
	],
	negative: [
		'crash', 'plunge', 'collapse', 'decline', 'fall', 'drop', 'tumble',
		'crisis', 'failure', 'disaster', 'attack', 'conflict', 'war',
		'rejected', 'cancelled', 'downgraded', 'weak', 'missed expectations',
		'scandal', 'fraud', 'investigation', 'indictment', 'lawsuit'
	]
};

/**
 * Check if text contains any alert keywords and return severity
 */
export function detectAlertLevel(text: string): 'critical' | 'high' | 'medium' | null {
	const lowerText = text.toLowerCase();

	for (const keyword of ALERT_KEYWORDS.critical) {
		if (lowerText.includes(keyword.toLowerCase())) {
			return 'critical';
		}
	}

	for (const keyword of ALERT_KEYWORDS.high) {
		if (lowerText.includes(keyword.toLowerCase())) {
			return 'high';
		}
	}

	for (const keyword of ALERT_KEYWORDS.medium) {
		if (lowerText.includes(keyword.toLowerCase())) {
			return 'medium';
		}
	}

	return null;
}

/**
 * Detect regions mentioned in text
 */
export function detectRegions(text: string): string[] {
	const lowerText = text.toLowerCase();
	const detected: string[] = [];

	for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
		for (const keyword of keywords) {
			if (lowerText.includes(keyword.toLowerCase())) {
				detected.push(region);
				break;
			}
		}
	}

	return detected;
}

/**
 * Detect topics in text
 */
export function detectTopics(text: string): string[] {
	const lowerText = text.toLowerCase();
	const detected: string[] = [];

	for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
		let score = 0;
		for (const keyword of keywords) {
			if (lowerText.includes(keyword.toLowerCase())) {
				score++;
			}
		}
		// Require at least 2 keyword matches for topic detection
		if (score >= 2) {
			detected.push(topic);
		}
	}

	return detected;
}

/**
 * Detect sentiment from text
 */
export function detectSentiment(text: string): 'positive' | 'negative' | 'neutral' {
	const lowerText = text.toLowerCase();
	let positiveScore = 0;
	let negativeScore = 0;

	for (const keyword of SENTIMENT_KEYWORDS.positive) {
		if (lowerText.includes(keyword.toLowerCase())) {
			positiveScore++;
		}
	}

	for (const keyword of SENTIMENT_KEYWORDS.negative) {
		if (lowerText.includes(keyword.toLowerCase())) {
			negativeScore++;
		}
	}

	if (positiveScore > negativeScore + 1) return 'positive';
	if (negativeScore > positiveScore + 1) return 'negative';
	return 'neutral';
}

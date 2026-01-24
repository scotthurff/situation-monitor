/**
 * RSS feed and news source configuration
 *
 * Expanded for comprehensive US politics, legal, immigration, and macro tracking
 */

import type { NewsCategory, IntelSource } from '$lib/types';

export interface FeedSource {
	name: string;
	url: string;
	priority?: number; // Lower = higher priority
	bias?: 'left' | 'center-left' | 'center' | 'center-right' | 'right'; // Political leaning for transparency
}

/**
 * Main news feeds organized by category
 * Each category has multiple sources for redundancy
 */
export const FEEDS: Record<NewsCategory, FeedSource[]> = {
	// General international politics
	// Note: Some feeds use Google News RSS as proxy to avoid datacenter IP blocks
	politics: [
		{ name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', priority: 1, bias: 'center' },
		{ name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', priority: 1, bias: 'center-left' },
		{ name: 'Guardian World', url: 'https://www.theguardian.com/world/rss', priority: 2, bias: 'center-left' },
		{ name: 'Reuters World', url: 'https://news.google.com/rss/search?q=site:reuters.com+world+news&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'AP News', url: 'https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'Foreign Affairs', url: 'https://news.google.com/rss/search?q=site:foreignaffairs.com&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'The Economist', url: 'https://news.google.com/rss/search?q=site:economist.com&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'Foreign Policy', url: 'https://news.google.com/rss/search?q=site:foreignpolicy.com&hl=en-US&gl=US&ceid=US:en', priority: 2, bias: 'center' }
	],

	// US-specific political news - comprehensive coverage across the spectrum
	uspolitics: [
		// Curated Aggregators
		{ name: 'Memeorandum', url: 'http://www.memeorandum.com/feed.xml', priority: 1, bias: 'center' },
		{ name: 'RealClearPolitics', url: 'https://news.google.com/rss/search?q=site:realclearpolitics.com&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'Drudge Report', url: 'https://news.google.com/rss/search?q=site:drudgereport.com&hl=en-US&gl=US&ceid=US:en', priority: 2, bias: 'right' },

		// Primary US Politics Sources (using Google News RSS to avoid IP blocks)
		{ name: 'Politico', url: 'https://news.google.com/rss/search?q=site:politico.com&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'The Hill', url: 'https://thehill.com/feed/', priority: 1, bias: 'center' },
		{ name: 'Roll Call', url: 'https://www.rollcall.com/feed/', priority: 1, bias: 'center' },
		{ name: 'C-SPAN', url: 'https://news.google.com/rss/search?q=site:c-span.org&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },

		// Center-Left Sources
		{ name: 'Washington Post', url: 'https://feeds.washingtonpost.com/rss/politics', priority: 1, bias: 'center-left' },
		{ name: 'NY Times Politics', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', priority: 1, bias: 'center-left' },
		{ name: 'The Atlantic', url: 'https://news.google.com/rss/search?q=site:theatlantic.com+politics&hl=en-US&gl=US&ceid=US:en', priority: 2, bias: 'center-left' },
		{ name: 'Axios', url: 'https://www.axios.com/feeds/feed.rss', priority: 2, bias: 'center' },
		{ name: 'Vox', url: 'https://www.vox.com/rss/index.xml', priority: 3, bias: 'left' },
		{ name: 'ProPublica', url: 'https://news.google.com/rss/search?q=site:propublica.org&hl=en-US&gl=US&ceid=US:en', priority: 2, bias: 'center-left' },

		// Center-Right Sources
		{ name: 'Wall Street Journal Politics', url: 'https://feeds.a.dj.com/rss/RSSOpinion.xml', priority: 1, bias: 'center-right' },
		{ name: 'National Review', url: 'https://www.nationalreview.com/feed/', priority: 2, bias: 'right' },
		{ name: 'The Dispatch', url: 'https://thedispatch.com/feed/', priority: 2, bias: 'center-right' },
		{ name: 'Reason', url: 'https://reason.com/feed/', priority: 3, bias: 'center-right' },

		// Congressional Coverage
		{ name: 'Congress.gov Activity', url: 'https://news.google.com/rss/search?q=site:congress.gov+bill&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'GovTrack', url: 'https://www.govtrack.us/events/events.rss', priority: 2, bias: 'center' }
	],

	// Legal and court news
	legal: [
		// Supreme Court
		{ name: 'SCOTUSblog', url: 'https://www.scotusblog.com/feed/', priority: 1, bias: 'center' },
		{ name: 'Oyez', url: 'https://www.oyez.org/cases/rss', priority: 2, bias: 'center' },

		// Legal News (using Google News RSS to avoid IP blocks)
		{ name: 'Law360', url: 'https://news.google.com/rss/search?q=site:law360.com&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'Reuters Legal', url: 'https://news.google.com/rss/search?q=site:reuters.com+legal&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'Lawfare', url: 'https://news.google.com/rss/search?q=site:lawfaremedia.org&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'Just Security', url: 'https://news.google.com/rss/search?q=site:justsecurity.org&hl=en-US&gl=US&ceid=US:en', priority: 2, bias: 'center-left' },

		// DOJ and Courts
		{ name: 'DOJ Press', url: 'https://news.google.com/rss/search?q=site:justice.gov&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'Courthouse News', url: 'https://www.courthousenews.com/feed/', priority: 2, bias: 'center' },

		// Legal Commentary
		{ name: 'Volokh Conspiracy', url: 'https://reason.com/volokh/feed/', priority: 3, bias: 'center-right' },
		{ name: 'Election Law Blog', url: 'https://electionlawblog.org/?feed=rss2', priority: 3, bias: 'center' }
	],

	// Immigration and border enforcement
	immigration: [
		// Government Sources (using Google News RSS to avoid IP blocks)
		{ name: 'ICE News', url: 'https://news.google.com/rss/search?q=site:ice.gov&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'CBP Newsroom', url: 'https://news.google.com/rss/search?q=site:cbp.gov&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'USCIS News', url: 'https://news.google.com/rss/search?q=site:uscis.gov&hl=en-US&gl=US&ceid=US:en', priority: 2, bias: 'center' },
		{ name: 'DHS Press', url: 'https://news.google.com/rss/search?q=site:dhs.gov+news&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },

		// Immigration News & Analysis
		{ name: 'Migration Policy', url: 'https://www.migrationpolicy.org/rss.xml', priority: 1, bias: 'center' },
		{ name: 'TRAC Immigration', url: 'https://trac.syr.edu/immigration/rss/', priority: 1, bias: 'center' },
		{ name: 'Border Report', url: 'https://www.borderreport.com/feed/', priority: 2, bias: 'center' },
		{ name: 'Immigration Impact', url: 'https://immigrationimpact.com/feed/', priority: 3, bias: 'center-left' },

		// Legal Immigration News
		{ name: 'AILA', url: 'https://news.google.com/rss/search?q=site:aila.org&hl=en-US&gl=US&ceid=US:en', priority: 2, bias: 'center-left' }
	],

	tech: [
		{ name: 'Techmeme', url: 'https://www.techmeme.com/feed.xml', priority: 1 },
		{ name: 'Hacker News', url: 'https://hnrss.org/frontpage', priority: 1 },
		{ name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', priority: 2 },
		{ name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', priority: 2 },
		{ name: 'TechCrunch', url: 'https://techcrunch.com/feed/', priority: 2 },
		{ name: 'Wired', url: 'https://www.wired.com/feed/rss', priority: 3 }
	],

	finance: [
		{ name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', priority: 1 },
		{ name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories', priority: 1 },
		{ name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss', priority: 1 },
		{ name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', priority: 2 },
		{ name: 'Financial Times', url: 'https://www.ft.com/rss/home', priority: 2 },
		{ name: 'Zero Hedge', url: 'https://feeds.feedburner.com/zerohedge/feed', priority: 3, bias: 'right' },
		{ name: 'Calculated Risk', url: 'https://www.calculatedriskblog.com/feeds/posts/default?alt=rss', priority: 2, bias: 'center' }
	],

	gov: [
		{ name: 'White House', url: 'https://www.whitehouse.gov/news/feed/', priority: 1 },
		{ name: 'Federal Reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml', priority: 1 },
		{ name: 'SEC', url: 'https://www.sec.gov/news/pressreleases.rss', priority: 2 },
		{ name: 'DoD News', url: 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945', priority: 2 },
		{ name: 'State Dept', url: 'https://www.state.gov/rss-feed/press-releases/feed/', priority: 2 },
		{ name: 'Treasury Dept', url: 'https://news.google.com/rss/search?q=site:treasury.gov&hl=en-US&gl=US&ceid=US:en', priority: 1 },
		{ name: 'GAO Reports', url: 'https://www.gao.gov/rss/reports.xml', priority: 2 },
		{ name: 'CBO', url: 'https://news.google.com/rss/search?q=site:cbo.gov&hl=en-US&gl=US&ceid=US:en', priority: 2 }
	],

	ai: [
		{ name: 'OpenAI Blog', url: 'https://openai.com/news/rss.xml', priority: 1 },
		{ name: 'ArXiv AI', url: 'https://rss.arxiv.org/rss/cs.AI', priority: 1 },
		{ name: 'DeepMind Blog', url: 'https://deepmind.google/blog/rss.xml', priority: 2 },
		{ name: 'MIT AI', url: 'https://news.google.com/rss/search?q=site:news.mit.edu+artificial+intelligence&hl=en-US&gl=US&ceid=US:en', priority: 2 },
		{ name: 'AI News', url: 'https://news.google.com/rss/search?q=artificial+intelligence+news&hl=en-US&gl=US&ceid=US:en', priority: 3 }
	],

	// Think tanks and intelligence analysis - balanced across political spectrum
	// Using Google News RSS for sites that block datacenter IPs
	intel: [
		// Center/Center-Left Think Tanks
		{ name: 'CSIS', url: 'https://news.google.com/rss/search?q=site:csis.org&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'center' },
		{ name: 'Brookings', url: 'https://www.brookings.edu/feed/', priority: 1, bias: 'center-left' },
		{ name: 'CFR', url: 'https://news.google.com/rss/search?q=site:cfr.org&hl=en-US&gl=US&ceid=US:en', priority: 2, bias: 'center' },
		{ name: 'RAND', url: 'https://www.rand.org/news.xml', priority: 2, bias: 'center' },
		{ name: 'Carnegie', url: 'https://carnegieendowment.org/rss/solr/?fa=recentpubs', priority: 2, bias: 'center' },
		{ name: 'Atlantic Council', url: 'https://www.atlanticcouncil.org/feed/', priority: 2, bias: 'center' },
		{ name: 'Center for American Progress', url: 'https://news.google.com/rss/search?q=site:americanprogress.org&hl=en-US&gl=US&ceid=US:en', priority: 3, bias: 'left' },

		// Center-Right/Right Think Tanks
		{ name: 'Heritage Foundation', url: 'https://news.google.com/rss/search?q=site:heritage.org&hl=en-US&gl=US&ceid=US:en', priority: 1, bias: 'right' },
		{ name: 'AEI', url: 'https://www.aei.org/feed/', priority: 1, bias: 'center-right' },
		{ name: 'Cato Institute', url: 'https://www.cato.org/rss.xml', priority: 2, bias: 'center-right' },
		{ name: 'Hoover Institution', url: 'https://news.google.com/rss/search?q=site:hoover.org&hl=en-US&gl=US&ceid=US:en', priority: 2, bias: 'center-right' },
		{ name: 'Manhattan Institute', url: 'https://news.google.com/rss/search?q=site:manhattan-institute.org&hl=en-US&gl=US&ceid=US:en', priority: 3, bias: 'center-right' },
		{ name: 'Hudson Institute', url: 'https://news.google.com/rss/search?q=site:hudson.org&hl=en-US&gl=US&ceid=US:en', priority: 3, bias: 'center-right' }
	],

	// Macroeconomic data and analysis
	macro: [
		// Fed and Central Banks
		{ name: 'Federal Reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml', priority: 1 },
		{ name: 'St. Louis Fed', url: 'https://fredblog.stlouisfed.org/feed/', priority: 1 },
		{ name: 'NY Fed', url: 'https://libertystreeteconomics.newyorkfed.org/feeds/posts/default', priority: 2 },
		{ name: 'ECB', url: 'https://www.ecb.europa.eu/rss/press.html', priority: 2 },

		// Economic Data (using Google News RSS for blocked gov sites)
		{ name: 'BLS News', url: 'https://www.bls.gov/feed/bls_latest.rss', priority: 1 },
		{ name: 'BEA News', url: 'https://news.google.com/rss/search?q=site:bea.gov&hl=en-US&gl=US&ceid=US:en', priority: 1 },
		{ name: 'Census Economic', url: 'https://news.google.com/rss/search?q=site:census.gov+economic&hl=en-US&gl=US&ceid=US:en', priority: 2 },

		// Economic Analysis
		{ name: 'Calculated Risk', url: 'https://www.calculatedriskblog.com/feeds/posts/default?alt=rss', priority: 1 },
		{ name: 'Econbrowser', url: 'https://econbrowser.com/feed', priority: 2 },
		{ name: 'Marginal Revolution', url: 'https://marginalrevolution.com/feed', priority: 3 }
	]
};

/**
 * Extended intel sources for the Intel panel
 * Includes balanced representation across the political spectrum
 */
export const INTEL_SOURCES: IntelSource[] = [
	// Think Tanks - Center/Center-Left (using Google News RSS for blocked sites)
	{
		name: 'CSIS',
		url: 'https://news.google.com/rss/search?q=site:csis.org&hl=en-US&gl=US&ceid=US:en',
		type: 'think-tank',
		topics: ['defense', 'geopolitics', 'technology']
	},
	{
		name: 'Brookings',
		url: 'https://www.brookings.edu/feed/',
		type: 'think-tank',
		topics: ['policy', 'economics', 'governance']
	},
	{
		name: 'CFR',
		url: 'https://news.google.com/rss/search?q=site:cfr.org&hl=en-US&gl=US&ceid=US:en',
		type: 'think-tank',
		topics: ['foreign-policy', 'diplomacy']
	},
	{
		name: 'RAND',
		url: 'https://www.rand.org/news.xml',
		type: 'think-tank',
		topics: ['defense', 'policy', 'technology']
	},
	{
		name: 'Carnegie',
		url: 'https://carnegieendowment.org/rss/solr/?fa=recentpubs',
		type: 'think-tank',
		topics: ['geopolitics', 'governance']
	},
	{
		name: 'Atlantic Council',
		url: 'https://www.atlanticcouncil.org/feed/',
		type: 'think-tank',
		topics: ['defense', 'geopolitics', 'europe']
	},

	// Think Tanks - Center-Right/Right (using Google News RSS for blocked sites)
	{
		name: 'Heritage Foundation',
		url: 'https://news.google.com/rss/search?q=site:heritage.org&hl=en-US&gl=US&ceid=US:en',
		type: 'think-tank',
		topics: ['policy', 'economics', 'defense']
	},
	{
		name: 'AEI',
		url: 'https://www.aei.org/feed/',
		type: 'think-tank',
		topics: ['economics', 'policy', 'foreign-policy']
	},
	{
		name: 'Cato Institute',
		url: 'https://www.cato.org/rss.xml',
		type: 'think-tank',
		topics: ['economics', 'liberty', 'foreign-policy']
	},
	{
		name: 'Hoover Institution',
		url: 'https://news.google.com/rss/search?q=site:hoover.org&hl=en-US&gl=US&ceid=US:en',
		type: 'think-tank',
		topics: ['economics', 'history', 'policy']
	},
	{
		name: 'Hudson Institute',
		url: 'https://news.google.com/rss/search?q=site:hudson.org&hl=en-US&gl=US&ceid=US:en',
		type: 'think-tank',
		topics: ['defense', 'foreign-policy', 'technology']
	},
	{
		name: 'Manhattan Institute',
		url: 'https://news.google.com/rss/search?q=site:manhattan-institute.org&hl=en-US&gl=US&ceid=US:en',
		type: 'think-tank',
		topics: ['economics', 'urban-policy', 'education']
	},

	// Defense
	{
		name: 'Defense One',
		url: 'https://www.defenseone.com/rss/all/',
		type: 'defense',
		topics: ['military', 'defense', 'procurement']
	},
	{
		name: 'War on the Rocks',
		url: 'https://warontherocks.com/feed/',
		type: 'defense',
		topics: ['military', 'strategy', 'policy']
	},
	{
		name: 'Breaking Defense',
		url: 'https://breakingdefense.com/feed/',
		type: 'defense',
		topics: ['military', 'defense', 'technology']
	},
	{
		name: 'The Drive - War Zone',
		url: 'https://www.thedrive.com/the-war-zone/feed',
		type: 'defense',
		topics: ['military', 'aviation', 'technology']
	},

	// Regional
	{
		name: 'The Diplomat',
		url: 'https://thediplomat.com/feed/',
		type: 'regional',
		topics: ['asia-pacific', 'china', 'japan'],
		region: 'APAC'
	},
	{
		name: 'Al-Monitor',
		url: 'https://www.al-monitor.com/rss',
		type: 'regional',
		topics: ['middle-east', 'iran', 'turkey'],
		region: 'MENA'
	},

	// OSINT
	{
		name: 'Bellingcat',
		url: 'https://www.bellingcat.com/feed/',
		type: 'osint',
		topics: ['investigation', 'verification', 'conflict']
	},

	// Cyber
	{
		name: 'CISA Alerts',
		url: 'https://www.cisa.gov/uscert/ncas/alerts.xml',
		type: 'cyber',
		topics: ['cybersecurity', 'vulnerabilities', 'threats']
	},
	{
		name: 'Krebs on Security',
		url: 'https://krebsonsecurity.com/feed/',
		type: 'cyber',
		topics: ['cybersecurity', 'breaches', 'crime']
	},
	{
		name: 'The Record',
		url: 'https://therecord.media/feed/',
		type: 'cyber',
		topics: ['cybersecurity', 'policy', 'threats']
	},

	// Government Sources
	{
		name: 'Congressional Research Service',
		url: 'https://news.google.com/rss/search?q=site:crsreports.congress.gov&hl=en-US&gl=US&ceid=US:en',
		type: 'govt',
		topics: ['legislation', 'policy', 'research']
	},
	{
		name: 'GAO',
		url: 'https://www.gao.gov/rss/reports.xml',
		type: 'govt',
		topics: ['oversight', 'audit', 'policy']
	}
];

/**
 * Get all unique feed URLs for prefetching
 */
export function getAllFeedUrls(): string[] {
	const urls = new Set<string>();

	Object.values(FEEDS).forEach((sources) => {
		sources.forEach((source) => urls.add(source.url));
	});

	INTEL_SOURCES.forEach((source) => urls.add(source.url));

	return Array.from(urls);
}

/**
 * Get feeds for a specific category
 */
export function getFeedsForCategory(category: NewsCategory): FeedSource[] {
	return FEEDS[category] || [];
}

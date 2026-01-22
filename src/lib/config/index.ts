/**
 * Configuration barrel export
 */

export {
	FEEDS,
	INTEL_SOURCES,
	getAllFeedUrls,
	getFeedsForCategory,
	type FeedSource
} from './feeds';

export {
	FINNHUB_API_KEY,
	FRED_API_KEY,
	API_URLS,
	CORS_PROXIES,
	fetchWithProxy,
	API_DELAYS,
	CACHE_TTLS,
	REFRESH_INTERVALS,
	REFRESH_STAGE_DELAYS,
	TIMEOUTS,
	DEBUG,
	logger
} from './api';

export {
	ALERT_KEYWORDS,
	REGION_KEYWORDS,
	TOPIC_KEYWORDS,
	SENTIMENT_KEYWORDS,
	detectAlertLevel,
	detectRegions,
	detectTopics,
	detectSentiment
} from './keywords';

export {
	INDICES,
	STOCKS,
	CRYPTO_IDS,
	COMMODITIES,
	FOREX,
	TREASURY_YIELDS,
	FRED_INDICATORS,
	getChangeColor,
	formatPrice,
	formatChange,
	type MarketSymbol
} from './markets';

export {
	PANELS,
	getPanelsByCategory,
	getPanelsByStage,
	getDefaultEnabledPanels,
	getPanelById,
	type PanelDefinition
} from './panels';

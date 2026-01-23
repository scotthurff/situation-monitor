/**
 * API Configuration
 */

import { browser } from '$app/environment';

/**
 * Environment variable helpers
 */
function getEnvVar(key: string): string {
	if (browser) {
		return (import.meta.env?.[key] as string) ?? '';
	}
	return (process.env[key] as string) ?? '';
}

/**
 * API Keys (from environment variables)
 */
export const FINNHUB_API_KEY = getEnvVar('VITE_FINNHUB_API_KEY');
export const FRED_API_KEY = getEnvVar('VITE_FRED_API_KEY');
export const CONGRESS_API_KEY = getEnvVar('VITE_CONGRESS_API_KEY');

/**
 * API Base URLs
 */
export const API_URLS = {
	finnhub: 'https://finnhub.io/api/v1',
	fred: 'https://api.stlouisfed.org/fred',
	coingecko: 'https://api.coingecko.com/api/v3',
	polymarket: 'https://gamma-api.polymarket.com',
	kalshi: 'https://api.elections.kalshi.com/trade-api/v2',
	usaspending: 'https://api.usaspending.gov/api/v2',
	congress: 'https://api.congress.gov/v3',
	feargreed: 'https://api.alternative.me/fng'
} as const;

/**
 * CORS Proxy Configuration
 * Primary: our own server-side proxy (no CORS issues)
 * Fallback: external proxies for redundancy
 */
export const CORS_PROXIES = [
	// Fallback 1: corsproxy.io
	'https://corsproxy.io/?url=',
	// Fallback 2: allorigins
	'https://api.allorigins.win/raw?url='
] as const;

/**
 * Fetch URL through our server-side proxy (primary) or external CORS proxy (fallback)
 * Server-side proxy eliminates CORS issues entirely
 */
export async function fetchWithProxy(
	url: string,
	options: RequestInit = {}
): Promise<Response> {
	const encodedUrl = encodeURIComponent(url);
	let lastError: Error | undefined;

	// Primary: Use our own server-side proxy (works from any domain)
	if (browser) {
		try {
			const proxyUrl = `/api/proxy?url=${encodedUrl}`;
			const response = await fetch(proxyUrl, options);

			if (response.ok) {
				return response;
			}

			console.warn(`[Proxy] Server proxy returned ${response.status}, trying external proxies...`);
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			console.warn(`[Proxy] Server proxy failed:`, lastError.message);
		}
	}

	// Fallback: External CORS proxies
	for (const proxy of CORS_PROXIES) {
		try {
			const proxyUrl = proxy.includes('?url=')
				? `${proxy}${encodedUrl}`
				: `${proxy}${url}`;

			const response = await fetch(proxyUrl, {
				...options,
				headers: {
					...options.headers,
					'X-Requested-With': 'XMLHttpRequest'
				}
			});

			if (response.ok) {
				return response;
			}

			console.warn(`[CORS] Proxy ${proxy} returned ${response.status}, trying next...`);
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			console.warn(`[CORS] Proxy ${proxy} failed:`, lastError.message);
		}
	}

	throw lastError ?? new Error('All proxies failed');
}

/**
 * API Rate Limiting Delays (ms)
 */
export const API_DELAYS = {
	betweenCategories: 300,
	betweenFeeds: 100,
	betweenRetries: 1000
} as const;

/**
 * Cache TTLs (ms)
 */
export const CACHE_TTLS = {
	news: 5 * 60 * 1000, // 5 minutes
	markets: 60 * 1000, // 1 minute
	crypto: 60 * 1000, // 1 minute
	commodities: 5 * 60 * 1000, // 5 minutes
	fed: 30 * 60 * 1000, // 30 minutes
	intel: 10 * 60 * 1000, // 10 minutes
	polymarket: 5 * 60 * 1000, // 5 minutes
	default: 5 * 60 * 1000 // 5 minutes
} as const;

/**
 * Refresh intervals (ms)
 */
export const REFRESH_INTERVALS = {
	critical: 60 * 1000, // 1 minute - news, markets
	secondary: 5 * 60 * 1000, // 5 minutes - crypto, commodities
	tertiary: 10 * 60 * 1000, // 10 minutes - polymarket, intel
	default: 5 * 60 * 1000 // 5 minutes
} as const;

/**
 * Multi-stage refresh delays (ms)
 * Stagger requests to avoid overwhelming APIs
 */
export const REFRESH_STAGE_DELAYS = {
	critical: 0, // Immediate
	secondary: 2000, // 2 seconds after critical
	tertiary: 4000 // 4 seconds after critical
} as const;

/**
 * Request timeouts (ms)
 */
export const TIMEOUTS = {
	rss: 15000, // RSS feeds can be slow
	api: 10000, // Standard API calls
	market: 8000 // Market data should be fast
} as const;

/**
 * Debug configuration
 */
const isDev = browser ? import.meta.env?.DEV ?? false : false;

export const DEBUG = {
	enabled: isDev,
	logApiCalls: isDev,
	logCacheHits: false,
	logCircuitBreaker: true
} as const;

/**
 * Conditional logger
 */
export const logger = {
	log: (prefix: string, ...args: unknown[]) => {
		if (DEBUG.logApiCalls) {
			console.log(`[${prefix}]`, ...args);
		}
	},
	warn: (prefix: string, ...args: unknown[]) => {
		console.warn(`[${prefix}]`, ...args);
	},
	error: (prefix: string, ...args: unknown[]) => {
		console.error(`[${prefix}]`, ...args);
	},
	debug: (prefix: string, ...args: unknown[]) => {
		if (DEBUG.enabled) {
			console.debug(`[${prefix}]`, ...args);
		}
	}
};

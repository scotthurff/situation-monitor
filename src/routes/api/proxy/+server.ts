/**
 * Server-side proxy for external API requests
 * Eliminates CORS issues by proxying through our own server
 * Includes in-memory caching to reduce latency
 */

import type { RequestHandler } from './$types';

// Simple in-memory cache with TTL
const cache = new Map<string, { data: string; contentType: string; expires: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

function getCached(key: string): { data: string; contentType: string } | null {
	const entry = cache.get(key);
	if (entry && entry.expires > Date.now()) {
		return { data: entry.data, contentType: entry.contentType };
	}
	if (entry) {
		cache.delete(key); // Clean up expired entry
	}
	return null;
}

function setCache(key: string, data: string, contentType: string): void {
	// Limit cache size to prevent memory issues
	if (cache.size > 500) {
		// Delete oldest entries
		const keysToDelete = Array.from(cache.keys()).slice(0, 100);
		keysToDelete.forEach((k) => cache.delete(k));
	}
	cache.set(key, { data, contentType, expires: Date.now() + CACHE_TTL });
}

export const GET: RequestHandler = async ({ url }) => {
	const targetUrl = url.searchParams.get('url');

	if (!targetUrl) {
		return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		// Decode the URL if it's encoded
		const decodedUrl = decodeURIComponent(targetUrl);

		// Validate URL
		const parsedUrl = new URL(decodedUrl);

		// Allowlist of domains we'll proxy (security measure)
		const allowedDomains = [
			'news.google.com',
			'rsshub.app',
			'feeds.feedburner.com',
			'rss.nytimes.com',
			'feeds.bbci.co.uk',
			'www.politico.com',
			'thehill.com',
			'www.theverge.com',
			'techcrunch.com',
			'arstechnica.com',
			'www.wired.com',
			'api.gdeltproject.org',
			'www.federalreserve.gov',
			'www.whitehouse.gov',
			'www.oyez.org',
			'www.migrationpolicy.org',
			'www.scotusblog.com',
			'www.calculatedriskblog.com',
			'feeds.zerohedge.com',
			'query1.finance.yahoo.com',
			'api.coingecko.com',
			'gamma-api.polymarket.com',
			'api.elections.kalshi.com',
			'api.usaspending.gov',
			'api.congress.gov',
			'api.alternative.me',
			'api.stlouisfed.org',
			'finnhub.io'
		];

		const isAllowed = allowedDomains.some(
			(domain) => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
		);

		if (!isAllowed) {
			return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Check cache first
		const cached = getCached(decodedUrl);
		if (cached) {
			return new Response(cached.data, {
				status: 200,
				headers: {
					'Content-Type': cached.contentType,
					'Cache-Control': 'public, max-age=60',
					'X-Cache': 'HIT'
				}
			});
		}

		// Fetch the external resource
		const response = await fetch(decodedUrl, {
			headers: {
				'User-Agent': 'SituationMonitor/1.0',
				Accept: '*/*'
			}
		});

		if (!response.ok) {
			return new Response(
				JSON.stringify({ error: `Upstream error: ${response.status}` }),
				{
					status: response.status,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Get response body
		const body = await response.text();

		// Return with appropriate content type
		const contentType = response.headers.get('content-type') || 'text/plain';

		// Cache the response
		setCache(decodedUrl, body, contentType);

		return new Response(body, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=60',
				'X-Cache': 'MISS'
			}
		});
	} catch (error) {
		console.error('[Proxy] Error:', error);
		return new Response(
			JSON.stringify({ error: error instanceof Error ? error.message : 'Proxy error' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};

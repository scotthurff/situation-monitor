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
		// Includes all RSS feed domains from feeds.ts configuration
		const allowedDomains = [
			// APIs
			'api.gdeltproject.org',
			'api.coingecko.com',
			'api.congress.gov',
			'api.usaspending.gov',
			'api.elections.kalshi.com',
			'api.alternative.me',
			'api.stlouisfed.org',
			'gamma-api.polymarket.com',
			'query1.finance.yahoo.com',
			'finnhub.io',

			// Major news aggregators
			'news.google.com',
			'rsshub.app',
			'hnrss.org',
			'www.techmeme.com',
			'www.memeorandum.com',

			// Wire services & mainstream news
			'feeds.bbci.co.uk',
			'rss.nytimes.com',
			'feeds.npr.org',
			'www.theguardian.com',
			'www.reutersagency.com',
			'www.reuters.com',

			// US Politics
			'www.politico.com',
			'thehill.com',
			'www.rollcall.com',
			'www.c-span.org',
			'feeds.washingtonpost.com',
			'www.axios.com',
			'www.vox.com',
			'feeds.a.dj.com',
			'www.nationalreview.com',
			'thedispatch.com',
			'reason.com',
			'www.congress.gov',
			'www.govtrack.us',

			// Legal
			'www.scotusblog.com',
			'www.oyez.org',
			'www.law360.com',
			'www.lawfaremedia.org',
			'www.justsecurity.org',
			'www.justice.gov',
			'www.courthousenews.com',
			'electionlawblog.org',

			// Immigration
			'www.ice.gov',
			'www.cbp.gov',
			'www.uscis.gov',
			'www.dhs.gov',
			'www.migrationpolicy.org',
			'trac.syr.edu',
			'www.borderreport.com',
			'immigrationimpact.com',
			'www.aila.org',

			// Tech
			'techcrunch.com',
			'feeds.arstechnica.com',
			'www.theverge.com',
			'www.wired.com',

			// Finance
			'www.cnbc.com',
			'feeds.marketwatch.com',
			'feeds.bloomberg.com',
			'www.ft.com',
			'feeds.feedburner.com',
			'feeds.zerohedge.com',
			'www.calculatedriskblog.com',

			// Government
			'www.whitehouse.gov',
			'www.federalreserve.gov',
			'www.sec.gov',
			'www.defense.gov',
			'www.state.gov',
			'home.treasury.gov',
			'www.gao.gov',
			'www.cbo.gov',

			// AI
			'openai.com',
			'rss.arxiv.org',
			'deepmind.google',
			'news.mit.edu',
			'www.artificialintelligence-news.com',

			// Think tanks - Center/Left
			'www.csis.org',
			'www.brookings.edu',
			'www.cfr.org',
			'www.rand.org',
			'carnegieendowment.org',
			'www.atlanticcouncil.org',
			'www.americanprogress.org',

			// Think tanks - Center-Right/Right
			'www.heritage.org',
			'www.aei.org',
			'www.cato.org',
			'www.hoover.org',
			'www.manhattan-institute.org',
			'www.hudson.org',

			// Macro/Economics
			'fredblog.stlouisfed.org',
			'libertystreeteconomics.newyorkfed.org',
			'www.ecb.europa.eu',
			'www.bls.gov',
			'www.bea.gov',
			'www.census.gov',
			'econbrowser.com',
			'marginalrevolution.com',

			// Defense & Intel
			'www.defenseone.com',
			'warontherocks.com',
			'breakingdefense.com',
			'www.thedrive.com',
			'thediplomat.com',
			'www.al-monitor.com',
			'www.bellingcat.com',

			// Cyber
			'www.cisa.gov',
			'krebsonsecurity.com',
			'therecord.media',

			// Government research
			'crsreports.congress.gov'
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
		// Use a browser-like User-Agent to avoid being blocked by sites that filter bots
		const response = await fetch(decodedUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Accept: 'application/rss+xml, application/xml, text/xml, */*'
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

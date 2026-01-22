# Situation Monitor

Real-time intelligence dashboard for monitoring US politics, legal developments, macroeconomic indicators, and global events.

A reliable, self-hosted alternative inspired by [@hipcityreg's situation-monitor](https://github.com/hipcityreg/situation-monitor), with enhanced focus on US political and economic intelligence.

## Features

### News & Intelligence
- **Multi-source News Aggregation**: 40+ RSS feeds across politics, tech, finance, government, AI, and intel
- **US Politics Focus**: Congress, executive orders, political appointments, elections
- **Court Case Tracking**: Supreme Court decisions, federal courts, significant legal cases
- **Immigration & Enforcement**: ICE actions, border policy, detention data
- **Think Tank Analysis**: CSIS, Brookings, CFR, RAND, Heritage, AEI

### Markets & Economy
- **Stock Indices**: S&P 500, Dow, NASDAQ, Russell 2000, VIX
- **Crypto**: Bitcoin, Ethereum, and major altcoins via CoinGecko
- **Commodities**: Gold, silver, oil, natural gas, copper
- **Forex**: Major currency pairs and Dollar Index

### Macroeconomic Indicators (First-Class Citizens)
- **Fed Policy**: Fed Funds Rate, FOMC decisions, Fed balance sheet
- **Interest Rates**: Treasury yields (2Y, 5Y, 10Y, 30Y), yield curve
- **Monetary Supply**: M2, M1, money velocity
- **Inflation**: CPI, Core CPI, PCE, PPI
- **Employment**: Unemployment rate, jobless claims, JOLTS, NFP
- **Growth**: GDP, Industrial production, retail sales
- **Consumer**: Consumer sentiment, consumer confidence
- **Housing**: Housing starts, existing home sales, Case-Shiller
- **Trade**: Trade balance, import/export prices
- **Fiscal**: Federal debt, deficit, debt-to-GDP

### Analysis Engine
- **Correlation Detection**: Cross-source pattern recognition
- **Narrative Tracking**: Story evolution from fringe to mainstream
- **Entity Prominence**: "Main character" analysis
- **Sentiment Analysis**: Positive/negative/neutral classification
- **Regional Detection**: Geographic tagging of news items

### Reliability Features
- **Circuit Breaker Pattern**: Prevents cascading failures
- **Request Deduplication**: Eliminates redundant API calls
- **Multi-Level Caching**: In-memory cache with stale data fallback
- **Proxy Fallbacks**: Multiple CORS proxies for resilience
- **Multi-Stage Refresh**: Prioritized data loading

## Tech Stack

- **SvelteKit 2.0** with Svelte 5 runes (`$state`, `$derived`, `$effect`)
- **TypeScript** (strict mode)
- **Tailwind CSS 4**
- **Vitest** for testing

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

Copy `.env.example` to `.env` and optionally add API keys:

```bash
cp .env.example .env
```

**Optional API keys** (the app works without these but they enhance functionality):

| API | Purpose | Get Key |
|-----|---------|---------|
| Finnhub | Stock quotes, company data | [finnhub.io](https://finnhub.io/) |
| FRED | Federal Reserve economic data | [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html) |

## Architecture

```
src/lib/
├── analysis/        # Pattern correlation, narrative tracking, main character
├── api/             # Data fetching (news, markets, crypto, FRED)
├── components/
│   ├── common/      # Panel, NewsItem, MarketItem, LoadingSpinner
│   ├── layout/      # Header, Dashboard
│   └── panels/      # News, Markets, Crypto, Commodities, Alerts, Intel, etc.
├── config/
│   ├── feeds.ts     # 40+ RSS feed sources
│   ├── keywords.ts  # Alert keywords, region/topic detection
│   ├── markets.ts   # Indices, stocks, commodities, forex symbols
│   └── panels.ts    # Panel registry and configuration
├── services/
│   ├── cache.ts     # CacheManager with TTL
│   ├── circuit-breaker.ts  # CircuitBreaker for resilience
│   ├── client.ts    # ServiceClient with full resilience stack
│   └── deduplicator.ts     # RequestDeduplicator
├── stores/          # Svelte 5 reactive stores
│   ├── news.svelte.ts
│   ├── markets.svelte.ts
│   ├── settings.svelte.ts
│   └── refresh.svelte.ts
├── types/           # TypeScript interfaces
└── utils/           # Formatting helpers
```

## Data Sources

### News Feeds by Category

| Category | Sources |
|----------|---------|
| **Politics** | BBC World, NPR, Guardian, Reuters, AP News |
| **Tech** | Hacker News, Ars Technica, The Verge, TechCrunch, Wired |
| **Finance** | CNBC, MarketWatch, Bloomberg, Financial Times, BBC Business |
| **Government** | White House, Federal Reserve, SEC, DoD, State Dept |
| **AI** | OpenAI Blog, ArXiv AI, DeepMind, MIT AI |
| **Intel** | CSIS, Brookings, CFR, RAND, Bellingcat, Defense One |

### FRED Economic Indicators

| Category | Indicators |
|----------|------------|
| **Rates** | Fed Funds (FEDFUNDS), T-Bill, 2Y, 5Y, 10Y, 30Y yields |
| **Money** | M2 (M2SL), M1, Money Velocity |
| **Inflation** | CPI (CPIAUCSL), Core CPI, PCE, Core PCE |
| **Employment** | Unemployment (UNRATE), Claims, JOLTS, Participation |
| **Growth** | GDP (A191RL1Q225SBEA), Industrial Production |
| **Fed** | Balance Sheet (WALCL), TGA Balance |

## Refresh Strategy

Data is fetched in three prioritized stages:

1. **Critical (0ms)**: News feeds, market indices, alerts
2. **Secondary (+2s)**: Crypto, commodities, intel sources
3. **Tertiary (+4s)**: Economic indicators, analysis, less critical data

## Deployment

The app uses `@sveltejs/adapter-auto` which auto-detects deployment platforms:

- **Vercel**: Zero-config deployment
- **Netlify**: Zero-config deployment
- **Cloudflare Pages**: Use `@sveltejs/adapter-cloudflare`
- **Static**: Use `@sveltejs/adapter-static` for GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run check` to verify types
5. Submit a pull request

## License

MIT

## Acknowledgments

Inspired by [@hipcityreg's situation-monitor](https://github.com/hipcityreg/situation-monitor)

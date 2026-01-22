/**
 * Market data configuration
 */

export interface MarketSymbol {
	symbol: string;
	name: string;
	type: 'index' | 'stock' | 'etf' | 'crypto' | 'commodity' | 'forex';
}

/**
 * Major indices to track
 */
export const INDICES: MarketSymbol[] = [
	{ symbol: '^GSPC', name: 'S&P 500', type: 'index' },
	{ symbol: '^DJI', name: 'Dow Jones', type: 'index' },
	{ symbol: '^IXIC', name: 'NASDAQ', type: 'index' },
	{ symbol: '^RUT', name: 'Russell 2000', type: 'index' },
	{ symbol: '^VIX', name: 'VIX', type: 'index' },
	{ symbol: '^FTSE', name: 'FTSE 100', type: 'index' },
	{ symbol: '^GDAXI', name: 'DAX', type: 'index' },
	{ symbol: '^N225', name: 'Nikkei 225', type: 'index' },
	{ symbol: '^HSI', name: 'Hang Seng', type: 'index' }
];

/**
 * Major stocks to track
 */
export const STOCKS: MarketSymbol[] = [
	{ symbol: 'AAPL', name: 'Apple', type: 'stock' },
	{ symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
	{ symbol: 'GOOGL', name: 'Alphabet', type: 'stock' },
	{ symbol: 'AMZN', name: 'Amazon', type: 'stock' },
	{ symbol: 'NVDA', name: 'NVIDIA', type: 'stock' },
	{ symbol: 'META', name: 'Meta', type: 'stock' },
	{ symbol: 'TSLA', name: 'Tesla', type: 'stock' },
	{ symbol: 'BRK.B', name: 'Berkshire', type: 'stock' }
];

/**
 * Cryptocurrencies to track (CoinGecko IDs)
 */
export const CRYPTO_IDS = [
	'bitcoin',
	'ethereum',
	'solana',
	'ripple',
	'cardano',
	'dogecoin',
	'polkadot',
	'avalanche-2'
];

/**
 * Commodities to track
 */
export const COMMODITIES: MarketSymbol[] = [
	{ symbol: 'GC=F', name: 'Gold', type: 'commodity' },
	{ symbol: 'SI=F', name: 'Silver', type: 'commodity' },
	{ symbol: 'CL=F', name: 'Crude Oil', type: 'commodity' },
	{ symbol: 'NG=F', name: 'Natural Gas', type: 'commodity' },
	{ symbol: 'HG=F', name: 'Copper', type: 'commodity' },
	{ symbol: 'ZC=F', name: 'Corn', type: 'commodity' },
	{ symbol: 'ZW=F', name: 'Wheat', type: 'commodity' }
];

/**
 * Forex pairs
 */
export const FOREX: MarketSymbol[] = [
	{ symbol: 'EURUSD=X', name: 'EUR/USD', type: 'forex' },
	{ symbol: 'GBPUSD=X', name: 'GBP/USD', type: 'forex' },
	{ symbol: 'USDJPY=X', name: 'USD/JPY', type: 'forex' },
	{ symbol: 'USDCNY=X', name: 'USD/CNY', type: 'forex' },
	{ symbol: 'DX-Y.NYB', name: 'US Dollar Index', type: 'forex' }
];

/**
 * Treasury yields (FRED series IDs)
 */
export const TREASURY_YIELDS = {
	'1M': 'DGS1MO',
	'3M': 'DGS3MO',
	'6M': 'DGS6MO',
	'1Y': 'DGS1',
	'2Y': 'DGS2',
	'5Y': 'DGS5',
	'7Y': 'DGS7',
	'10Y': 'DGS10',
	'20Y': 'DGS20',
	'30Y': 'DGS30'
};

/**
 * Comprehensive FRED economic indicators organized by category
 */
export const FRED_INDICATORS = {
	// Interest Rates & Fed Policy
	rates: {
		'Fed Funds Rate': { id: 'FEDFUNDS', unit: '%', frequency: 'monthly' },
		'Fed Funds Target Upper': { id: 'DFEDTARU', unit: '%', frequency: 'daily' },
		'Fed Funds Target Lower': { id: 'DFEDTARL', unit: '%', frequency: 'daily' },
		'Prime Rate': { id: 'DPRIME', unit: '%', frequency: 'daily' },
		'Discount Rate': { id: 'INTDSRUSM193N', unit: '%', frequency: 'monthly' },
		'30-Year Mortgage': { id: 'MORTGAGE30US', unit: '%', frequency: 'weekly' },
		'15-Year Mortgage': { id: 'MORTGAGE15US', unit: '%', frequency: 'weekly' }
	},

	// Treasury Yields
	yields: {
		'3-Month T-Bill': { id: 'DTB3', unit: '%', frequency: 'daily' },
		'6-Month T-Bill': { id: 'DTB6', unit: '%', frequency: 'daily' },
		'1-Year Treasury': { id: 'DGS1', unit: '%', frequency: 'daily' },
		'2-Year Treasury': { id: 'DGS2', unit: '%', frequency: 'daily' },
		'5-Year Treasury': { id: 'DGS5', unit: '%', frequency: 'daily' },
		'10-Year Treasury': { id: 'DGS10', unit: '%', frequency: 'daily' },
		'30-Year Treasury': { id: 'DGS30', unit: '%', frequency: 'daily' },
		'10Y-2Y Spread': { id: 'T10Y2Y', unit: '%', frequency: 'daily' },
		'10Y-3M Spread': { id: 'T10Y3M', unit: '%', frequency: 'daily' },
		'5Y Breakeven Inflation': { id: 'T5YIE', unit: '%', frequency: 'daily' },
		'10Y Breakeven Inflation': { id: 'T10YIE', unit: '%', frequency: 'daily' }
	},

	// Inflation
	inflation: {
		'CPI (All Items)': { id: 'CPIAUCSL', unit: 'index', frequency: 'monthly' },
		'CPI YoY': { id: 'CPIAUCSL', unit: '%', frequency: 'monthly', transform: 'pc1' },
		'Core CPI': { id: 'CPILFESL', unit: 'index', frequency: 'monthly' },
		'Core CPI YoY': { id: 'CPILFESL', unit: '%', frequency: 'monthly', transform: 'pc1' },
		'PCE': { id: 'PCEPI', unit: 'index', frequency: 'monthly' },
		'PCE YoY': { id: 'PCEPI', unit: '%', frequency: 'monthly', transform: 'pc1' },
		'Core PCE': { id: 'PCEPILFE', unit: 'index', frequency: 'monthly' },
		'Core PCE YoY': { id: 'PCEPILFE', unit: '%', frequency: 'monthly', transform: 'pc1' },
		'PPI (Final Demand)': { id: 'PPIFIS', unit: 'index', frequency: 'monthly' },
		'Import Prices': { id: 'IR', unit: 'index', frequency: 'monthly' },
		'Export Prices': { id: 'IQ', unit: 'index', frequency: 'monthly' }
	},

	// Employment
	employment: {
		'Unemployment Rate': { id: 'UNRATE', unit: '%', frequency: 'monthly' },
		'U6 Unemployment': { id: 'U6RATE', unit: '%', frequency: 'monthly' },
		'Labor Force Participation': { id: 'CIVPART', unit: '%', frequency: 'monthly' },
		'Employment-Population Ratio': { id: 'EMRATIO', unit: '%', frequency: 'monthly' },
		'Nonfarm Payrolls': { id: 'PAYEMS', unit: 'thousands', frequency: 'monthly' },
		'Private Payrolls': { id: 'USPRIV', unit: 'thousands', frequency: 'monthly' },
		'Initial Claims': { id: 'ICSA', unit: 'thousands', frequency: 'weekly' },
		'Continued Claims': { id: 'CCSA', unit: 'thousands', frequency: 'weekly' },
		'JOLTS Job Openings': { id: 'JTSJOL', unit: 'thousands', frequency: 'monthly' },
		'JOLTS Quits': { id: 'JTSQUR', unit: '%', frequency: 'monthly' },
		'JOLTS Hires': { id: 'JTSHIR', unit: 'thousands', frequency: 'monthly' },
		'Avg Hourly Earnings': { id: 'CES0500000003', unit: '$', frequency: 'monthly' },
		'Avg Weekly Hours': { id: 'AWHAETP', unit: 'hours', frequency: 'monthly' }
	},

	// GDP & Growth
	growth: {
		'Real GDP': { id: 'GDPC1', unit: 'billions', frequency: 'quarterly' },
		'Real GDP Growth': { id: 'A191RL1Q225SBEA', unit: '%', frequency: 'quarterly' },
		'Nominal GDP': { id: 'GDP', unit: 'billions', frequency: 'quarterly' },
		'GDPNow Forecast': { id: 'GDPNOW', unit: '%', frequency: 'daily' },
		'Industrial Production': { id: 'INDPRO', unit: 'index', frequency: 'monthly' },
		'Capacity Utilization': { id: 'TCU', unit: '%', frequency: 'monthly' },
		'Chicago Fed Activity': { id: 'CFNAI', unit: 'index', frequency: 'monthly' },
		'LEI': { id: 'USSLIND', unit: 'index', frequency: 'monthly' }
	},

	// Money Supply & Fed Balance Sheet
	money: {
		'M1': { id: 'M1SL', unit: 'billions', frequency: 'monthly' },
		'M2': { id: 'M2SL', unit: 'billions', frequency: 'monthly' },
		'M2 YoY': { id: 'M2SL', unit: '%', frequency: 'monthly', transform: 'pc1' },
		'Money Velocity (M2)': { id: 'M2V', unit: 'ratio', frequency: 'quarterly' },
		'Fed Balance Sheet': { id: 'WALCL', unit: 'millions', frequency: 'weekly' },
		'Fed Treasury Holdings': { id: 'TREAST', unit: 'millions', frequency: 'weekly' },
		'Fed MBS Holdings': { id: 'WSHOMCB', unit: 'millions', frequency: 'weekly' },
		'Reserves': { id: 'TOTRESNS', unit: 'millions', frequency: 'monthly' },
		'Excess Reserves': { id: 'EXCSRESNS', unit: 'millions', frequency: 'monthly' },
		'TGA Balance': { id: 'WTREGEN', unit: 'millions', frequency: 'weekly' },
		'RRP Usage': { id: 'RRPONTSYD', unit: 'billions', frequency: 'daily' }
	},

	// Consumer
	consumer: {
		'Consumer Confidence': { id: 'UMCSENT', unit: 'index', frequency: 'monthly' },
		'Michigan Sentiment': { id: 'UMCSENT', unit: 'index', frequency: 'monthly' },
		'Retail Sales': { id: 'RSXFS', unit: 'millions', frequency: 'monthly' },
		'Retail Sales YoY': { id: 'RSXFS', unit: '%', frequency: 'monthly', transform: 'pc1' },
		'Personal Income': { id: 'PI', unit: 'billions', frequency: 'monthly' },
		'Personal Spending': { id: 'PCE', unit: 'billions', frequency: 'monthly' },
		'Personal Saving Rate': { id: 'PSAVERT', unit: '%', frequency: 'monthly' },
		'Consumer Credit': { id: 'TOTALSL', unit: 'billions', frequency: 'monthly' }
	},

	// Housing
	housing: {
		'Housing Starts': { id: 'HOUST', unit: 'thousands', frequency: 'monthly' },
		'Building Permits': { id: 'PERMIT', unit: 'thousands', frequency: 'monthly' },
		'New Home Sales': { id: 'HSN1F', unit: 'thousands', frequency: 'monthly' },
		'Existing Home Sales': { id: 'EXHOSLUSM495S', unit: 'millions', frequency: 'monthly' },
		'Pending Home Sales': { id: 'HSTPSA', unit: 'index', frequency: 'monthly' },
		'Case-Shiller National': { id: 'CSUSHPINSA', unit: 'index', frequency: 'monthly' },
		'Case-Shiller 20-City': { id: 'SPCS20RSA', unit: 'index', frequency: 'monthly' },
		'Median Home Price': { id: 'MSPUS', unit: '$', frequency: 'quarterly' },
		'Mortgage Applications': { id: 'WMARP', unit: 'index', frequency: 'weekly' }
	},

	// Trade
	trade: {
		'Trade Balance': { id: 'BOPGSTB', unit: 'millions', frequency: 'monthly' },
		'Exports': { id: 'BOPGEXP', unit: 'millions', frequency: 'monthly' },
		'Imports': { id: 'BOPGIMP', unit: 'millions', frequency: 'monthly' },
		'Current Account': { id: 'NETFI', unit: 'millions', frequency: 'quarterly' },
		'Dollar Index': { id: 'DTWEXBGS', unit: 'index', frequency: 'daily' }
	},

	// Fiscal & Debt
	fiscal: {
		'Federal Debt Total': { id: 'GFDEBTN', unit: 'millions', frequency: 'quarterly' },
		'Debt Held by Public': { id: 'FYGFDPUN', unit: 'millions', frequency: 'monthly' },
		'Debt-to-GDP': { id: 'GFDEGDQ188S', unit: '%', frequency: 'quarterly' },
		'Federal Surplus/Deficit': { id: 'FYFSD', unit: 'millions', frequency: 'annual' },
		'Interest on Debt': { id: 'A091RC1Q027SBEA', unit: 'billions', frequency: 'quarterly' }
	},

	// Financial Conditions
	financial: {
		'Chicago Fed Financial Conditions': { id: 'NFCI', unit: 'index', frequency: 'weekly' },
		'St. Louis Stress Index': { id: 'STLFSI4', unit: 'index', frequency: 'weekly' },
		'Kansas City Stress Index': { id: 'KCFSI', unit: 'index', frequency: 'monthly' },
		'Credit Spread (BAA-AAA)': { id: 'BAMLC0A4CBBB', unit: '%', frequency: 'daily' },
		'High Yield Spread': { id: 'BAMLH0A0HYM2', unit: '%', frequency: 'daily' },
		'TED Spread': { id: 'TEDRATE', unit: '%', frequency: 'daily' },
		'VIX': { id: 'VIXCLS', unit: 'index', frequency: 'daily' }
	}
};

/**
 * Economic calendar - key releases to track
 */
export const ECONOMIC_CALENDAR = {
	weekly: [
		{ name: 'Initial Jobless Claims', day: 'Thursday', time: '8:30 AM ET', importance: 'high' },
		{ name: 'Fed Balance Sheet', day: 'Thursday', time: '4:30 PM ET', importance: 'medium' },
		{ name: 'Baker Hughes Rig Count', day: 'Friday', time: '1:00 PM ET', importance: 'low' }
	],
	monthly: [
		{ name: 'Employment Situation', week: 1, day: 'Friday', time: '8:30 AM ET', importance: 'high' },
		{ name: 'CPI', week: 2, time: '8:30 AM ET', importance: 'high' },
		{ name: 'PPI', week: 2, time: '8:30 AM ET', importance: 'medium' },
		{ name: 'Retail Sales', week: 2, time: '8:30 AM ET', importance: 'high' },
		{ name: 'Industrial Production', week: 2, time: '9:15 AM ET', importance: 'medium' },
		{ name: 'Housing Starts', week: 3, time: '8:30 AM ET', importance: 'medium' },
		{ name: 'Existing Home Sales', week: 3, time: '10:00 AM ET', importance: 'medium' },
		{ name: 'Durable Goods', week: 4, time: '8:30 AM ET', importance: 'medium' },
		{ name: 'PCE', week: 4, time: '8:30 AM ET', importance: 'high' },
		{ name: 'Consumer Confidence', week: 4, time: '10:00 AM ET', importance: 'medium' },
		{ name: 'Michigan Sentiment', week: 4, day: 'Friday', time: '10:00 AM ET', importance: 'medium' },
		{ name: 'JOLTS', week: 1, time: '10:00 AM ET', importance: 'high' },
		{ name: 'ISM Manufacturing', week: 1, day: 'first business day', time: '10:00 AM ET', importance: 'high' },
		{ name: 'ISM Services', week: 1, time: '10:00 AM ET', importance: 'high' }
	],
	quarterly: [
		{ name: 'GDP (Advance)', month: [1, 4, 7, 10], week: 4, time: '8:30 AM ET', importance: 'high' },
		{ name: 'GDP (Second)', month: [2, 5, 8, 11], week: 4, time: '8:30 AM ET', importance: 'medium' },
		{ name: 'GDP (Final)', month: [3, 6, 9, 12], week: 4, time: '8:30 AM ET', importance: 'medium' },
		{ name: 'Flow of Funds', month: [3, 6, 9, 12], time: '12:00 PM ET', importance: 'low' }
	],
	fomc: [
		{ name: 'FOMC Meeting', frequency: '~6 weeks', time: '2:00 PM ET', importance: 'high' },
		{ name: 'FOMC Minutes', frequency: '3 weeks after meeting', time: '2:00 PM ET', importance: 'high' },
		{ name: 'Beige Book', frequency: '2 weeks before FOMC', time: '2:00 PM ET', importance: 'medium' }
	]
};

/**
 * Get color for price change
 */
export function getChangeColor(change: number): string {
	if (change > 0) return 'text-success';
	if (change < 0) return 'text-danger';
	return 'text-muted';
}

/**
 * Format price with appropriate decimals
 */
export function formatPrice(price: number, type: string): string {
	if (type === 'crypto' && price < 1) {
		return price.toFixed(6);
	}
	if (type === 'forex') {
		return price.toFixed(4);
	}
	if (price >= 1000) {
		return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}
	return price.toFixed(2);
}

/**
 * Format percentage change
 */
export function formatChange(change: number): string {
	const sign = change >= 0 ? '+' : '';
	return `${sign}${change.toFixed(2)}%`;
}

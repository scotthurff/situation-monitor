/**
 * API barrel export
 */

export {
	fetchCategoryNews,
	fetchAllNews,
	fetchIntelNews,
	fetchCombinedNews,
	fetchAlertNews
} from './news';

export {
	fetchIndices,
	fetchStocks,
	fetchCommodities,
	fetchForex,
	fetchAllMarkets
} from './markets';

export {
	fetchCryptoPrices,
	fetchCoinDetails,
	fetchGlobalCryptoData,
	formatCryptoMarketCap,
	formatCryptoPrice
} from './crypto';

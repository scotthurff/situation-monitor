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
	formatCryptoPrice,
	fetchFearGreedIndex,
	getFearGreedColor
} from './crypto';
export type { FearGreedIndex } from './crypto';

export { fetchSectorData, getMockSectorData, SECTOR_ETFS } from './sectors';

export {
	fetchTreasuryYields,
	fetchMacroIndicators,
	fetchFredIndicator,
	getMockYields,
	getMockIndicators,
	TREASURY_SERIES,
	MACRO_SERIES
} from './fred';

export {
	fetchGovContracts,
	fetchCongressBills,
	getMockContracts,
	getMockBills
} from './government';

export { fetchPolymarket } from './polymarket';

export { fetchLayoffs, getMockLayoffs } from './layoffs';

export { extractEntities, fetchMainCharacters, getMockCharacters } from './entities';

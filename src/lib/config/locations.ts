/**
 * City-level geocoding database for location extraction from news
 *
 * Each location includes:
 * - Primary name for display
 * - Coordinates (lat/lon)
 * - Aliases for text matching (lowercase)
 * - Region for grouping
 */

export interface GeoLocation {
	name: string;
	lat: number;
	lon: number;
	aliases: string[];
	region: string;
}

export const LOCATIONS: GeoLocation[] = [
	// ============================================
	// NORTH AMERICA
	// ============================================
	{
		name: 'Washington DC',
		lat: 38.9,
		lon: -77.0,
		aliases: ['washington', 'white house', 'pentagon', 'capitol', 'congress'],
		region: 'North America'
	},
	{
		name: 'New York',
		lat: 40.7,
		lon: -74.0,
		aliases: ['new york', 'nyc', 'manhattan', 'wall street'],
		region: 'North America'
	},
	{
		name: 'Los Angeles',
		lat: 34.05,
		lon: -118.25,
		aliases: ['los angeles', 'la', 'hollywood'],
		region: 'North America'
	},
	{
		name: 'San Francisco',
		lat: 37.77,
		lon: -122.42,
		aliases: ['san francisco', 'silicon valley'],
		region: 'North America'
	},
	{
		name: 'Ottawa',
		lat: 45.42,
		lon: -75.7,
		aliases: ['ottawa', 'canadian government'],
		region: 'North America'
	},
	{
		name: 'Mexico City',
		lat: 19.43,
		lon: -99.13,
		aliases: ['mexico city', 'mexican government'],
		region: 'North America'
	},

	// ============================================
	// EUROPE
	// ============================================
	{
		name: 'London',
		lat: 51.5,
		lon: -0.12,
		aliases: ['london', 'westminster', 'downing street', 'uk government'],
		region: 'Europe'
	},
	{
		name: 'Paris',
		lat: 48.85,
		lon: 2.35,
		aliases: ['paris', 'elysee', 'french government'],
		region: 'Europe'
	},
	{
		name: 'Berlin',
		lat: 52.52,
		lon: 13.4,
		aliases: ['berlin', 'bundestag', 'german government'],
		region: 'Europe'
	},
	{
		name: 'Brussels',
		lat: 50.85,
		lon: 4.35,
		aliases: ['brussels', 'eu', 'european union', 'nato headquarters'],
		region: 'Europe'
	},
	{
		name: 'Rome',
		lat: 41.9,
		lon: 12.5,
		aliases: ['rome', 'vatican', 'italian government'],
		region: 'Europe'
	},
	{
		name: 'Madrid',
		lat: 40.42,
		lon: -3.7,
		aliases: ['madrid', 'spanish government'],
		region: 'Europe'
	},
	{
		name: 'Warsaw',
		lat: 52.23,
		lon: 21.0,
		aliases: ['warsaw', 'polish government', 'poland'],
		region: 'Europe'
	},
	{
		name: 'Geneva',
		lat: 46.2,
		lon: 6.15,
		aliases: ['geneva', 'un', 'united nations'],
		region: 'Europe'
	},

	// ============================================
	// RUSSIA / CIS
	// ============================================
	{
		name: 'Moscow',
		lat: 55.75,
		lon: 37.6,
		aliases: ['moscow', 'kremlin', 'russian government', 'putin'],
		region: 'Russia/CIS'
	},
	{
		name: 'Kyiv',
		lat: 50.45,
		lon: 30.5,
		aliases: ['kyiv', 'kiev', 'ukrainian government', 'zelensky'],
		region: 'Russia/CIS'
	},
	{
		name: 'Minsk',
		lat: 53.9,
		lon: 27.55,
		aliases: ['minsk', 'belarus', 'lukashenko'],
		region: 'Russia/CIS'
	},
	{
		name: 'St Petersburg',
		lat: 59.93,
		lon: 30.32,
		aliases: ['st petersburg', 'saint petersburg'],
		region: 'Russia/CIS'
	},

	// ============================================
	// MIDDLE EAST
	// ============================================
	{
		name: 'Tehran',
		lat: 35.7,
		lon: 51.4,
		aliases: ['tehran', 'iran', 'iranian government', 'khamenei'],
		region: 'Middle East'
	},
	{
		name: 'Tel Aviv',
		lat: 32.07,
		lon: 34.78,
		aliases: ['tel aviv', 'israel', 'israeli government', 'netanyahu'],
		region: 'Middle East'
	},
	{
		name: 'Jerusalem',
		lat: 31.77,
		lon: 35.23,
		aliases: ['jerusalem'],
		region: 'Middle East'
	},
	{
		name: 'Gaza',
		lat: 31.5,
		lon: 34.47,
		aliases: ['gaza', 'gaza strip', 'hamas'],
		region: 'Middle East'
	},
	{
		name: 'Riyadh',
		lat: 24.7,
		lon: 46.7,
		aliases: ['riyadh', 'saudi', 'saudi arabia', 'mbs'],
		region: 'Middle East'
	},
	{
		name: 'Dubai',
		lat: 25.2,
		lon: 55.27,
		aliases: ['dubai', 'uae', 'emirates'],
		region: 'Middle East'
	},
	{
		name: 'Baghdad',
		lat: 33.3,
		lon: 44.4,
		aliases: ['baghdad', 'iraq', 'iraqi government'],
		region: 'Middle East'
	},
	{
		name: 'Damascus',
		lat: 33.5,
		lon: 36.3,
		aliases: ['damascus', 'syria', 'syrian government', 'assad'],
		region: 'Middle East'
	},
	{
		name: 'Beirut',
		lat: 33.89,
		lon: 35.5,
		aliases: ['beirut', 'lebanon', 'hezbollah'],
		region: 'Middle East'
	},
	{
		name: 'Ankara',
		lat: 39.93,
		lon: 32.85,
		aliases: ['ankara', 'turkey', 'turkish government', 'erdogan'],
		region: 'Middle East'
	},
	{
		name: 'Sanaa',
		lat: 15.35,
		lon: 44.2,
		aliases: ['sanaa', 'yemen', 'houthi'],
		region: 'Middle East'
	},

	// ============================================
	// ASIA PACIFIC
	// ============================================
	{
		name: 'Beijing',
		lat: 39.9,
		lon: 116.4,
		aliases: ['beijing', 'china', 'ccp', 'xi jinping', 'chinese government'],
		region: 'Asia Pacific'
	},
	{
		name: 'Shanghai',
		lat: 31.23,
		lon: 121.47,
		aliases: ['shanghai'],
		region: 'Asia Pacific'
	},
	{
		name: 'Hong Kong',
		lat: 22.3,
		lon: 114.2,
		aliases: ['hong kong'],
		region: 'Asia Pacific'
	},
	{
		name: 'Taipei',
		lat: 25.03,
		lon: 121.5,
		aliases: ['taipei', 'taiwan', 'tsmc'],
		region: 'Asia Pacific'
	},
	{
		name: 'Tokyo',
		lat: 35.68,
		lon: 139.76,
		aliases: ['tokyo', 'japan', 'japanese government'],
		region: 'Asia Pacific'
	},
	{
		name: 'Seoul',
		lat: 37.57,
		lon: 126.98,
		aliases: ['seoul', 'south korea', 'korean government'],
		region: 'Asia Pacific'
	},
	{
		name: 'Pyongyang',
		lat: 39.03,
		lon: 125.75,
		aliases: ['pyongyang', 'north korea', 'kim jong un', 'dprk'],
		region: 'Asia Pacific'
	},
	{
		name: 'New Delhi',
		lat: 28.6,
		lon: 77.2,
		aliases: ['delhi', 'new delhi', 'india', 'indian government', 'modi'],
		region: 'Asia Pacific'
	},
	{
		name: 'Mumbai',
		lat: 19.08,
		lon: 72.88,
		aliases: ['mumbai', 'bombay'],
		region: 'Asia Pacific'
	},
	{
		name: 'Singapore',
		lat: 1.35,
		lon: 103.82,
		aliases: ['singapore'],
		region: 'Asia Pacific'
	},
	{
		name: 'Jakarta',
		lat: -6.2,
		lon: 106.85,
		aliases: ['jakarta', 'indonesia'],
		region: 'Asia Pacific'
	},
	{
		name: 'Manila',
		lat: 14.6,
		lon: 120.98,
		aliases: ['manila', 'philippines'],
		region: 'Asia Pacific'
	},
	{
		name: 'Canberra',
		lat: -35.28,
		lon: 149.13,
		aliases: ['canberra', 'australia', 'australian government'],
		region: 'Asia Pacific'
	},

	// ============================================
	// LATIN AMERICA
	// ============================================
	{
		name: 'Caracas',
		lat: 10.5,
		lon: -66.9,
		aliases: ['caracas', 'venezuela', 'maduro'],
		region: 'Latin America'
	},
	{
		name: 'Brasilia',
		lat: -15.79,
		lon: -47.88,
		aliases: ['brasilia', 'brazil', 'brazilian government', 'lula'],
		region: 'Latin America'
	},
	{
		name: 'Buenos Aires',
		lat: -34.6,
		lon: -58.38,
		aliases: ['buenos aires', 'argentina', 'milei'],
		region: 'Latin America'
	},
	{
		name: 'Bogota',
		lat: 4.71,
		lon: -74.07,
		aliases: ['bogota', 'colombia'],
		region: 'Latin America'
	},
	{
		name: 'Havana',
		lat: 23.11,
		lon: -82.37,
		aliases: ['havana', 'cuba'],
		region: 'Latin America'
	},

	// ============================================
	// AFRICA
	// ============================================
	{
		name: 'Cairo',
		lat: 30.04,
		lon: 31.24,
		aliases: ['cairo', 'egypt', 'egyptian government'],
		region: 'Africa'
	},
	{
		name: 'Khartoum',
		lat: 15.5,
		lon: 32.53,
		aliases: ['khartoum', 'sudan'],
		region: 'Africa'
	},
	{
		name: 'Addis Ababa',
		lat: 9.03,
		lon: 38.75,
		aliases: ['addis ababa', 'ethiopia', 'african union'],
		region: 'Africa'
	},
	{
		name: 'Nairobi',
		lat: -1.29,
		lon: 36.82,
		aliases: ['nairobi', 'kenya'],
		region: 'Africa'
	},
	{
		name: 'Lagos',
		lat: 6.52,
		lon: 3.38,
		aliases: ['lagos', 'nigeria'],
		region: 'Africa'
	},
	{
		name: 'Pretoria',
		lat: -25.75,
		lon: 28.19,
		aliases: ['pretoria', 'south africa', 'johannesburg'],
		region: 'Africa'
	},

	// ============================================
	// SPECIAL LOCATIONS (Greenland, Arctic)
	// ============================================
	{
		name: 'Nuuk',
		lat: 64.18,
		lon: -51.72,
		aliases: ['nuuk', 'greenland'],
		region: 'Arctic'
	}
];

/**
 * Create a lookup map for faster alias matching
 */
export function createLocationLookup(): Map<string, GeoLocation> {
	const lookup = new Map<string, GeoLocation>();
	for (const loc of LOCATIONS) {
		// Add primary name
		lookup.set(loc.name.toLowerCase(), loc);
		// Add all aliases
		for (const alias of loc.aliases) {
			lookup.set(alias.toLowerCase(), loc);
		}
	}
	return lookup;
}

/**
 * Pre-built lookup for performance
 */
export const LOCATION_LOOKUP = createLocationLookup();

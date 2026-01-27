/**
 * RainViewer Weather API
 * Provides real-time satellite infrared imagery with ~10 minute latency
 * https://www.rainviewer.com/api.html
 */

export interface RadarFrame {
	time: number; // Unix timestamp
	path: string; // Tile path prefix
}

export interface WeatherMapsResponse {
	version: string;
	generated: number;
	host: string;
	radar: {
		past: RadarFrame[];
		nowcast: RadarFrame[];
	};
	satellite: {
		infrared: RadarFrame[];
	};
}

let cachedWeatherMaps: WeatherMapsResponse | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch available weather map frames from RainViewer
 * Returns satellite IR frames (global coverage) and radar frames (limited coverage)
 */
export async function fetchWeatherMaps(): Promise<WeatherMapsResponse | null> {
	// Return cached data if still fresh
	if (cachedWeatherMaps && Date.now() - cacheTimestamp < CACHE_TTL) {
		return cachedWeatherMaps;
	}

	try {
		const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
		if (!res.ok) {
			console.warn('[Weather] RainViewer API error:', res.status);
			return cachedWeatherMaps; // Return stale cache on error
		}

		const data: WeatherMapsResponse = await res.json();
		cachedWeatherMaps = data;
		cacheTimestamp = Date.now();
		return data;
	} catch (err) {
		console.warn('[Weather] Failed to fetch weather maps:', err);
		return cachedWeatherMaps; // Return stale cache on error
	}
}

/**
 * Get the latest satellite infrared frame
 * Satellite IR provides global coverage unlike radar
 */
export async function getLatestSatelliteFrame(): Promise<RadarFrame | null> {
	const maps = await fetchWeatherMaps();
	if (!maps?.satellite?.infrared?.length) return null;

	// Return the most recent frame
	return maps.satellite.infrared[maps.satellite.infrared.length - 1];
}

/**
 * Get the latest radar frame
 * Note: Radar has limited coverage (only where ground stations exist)
 */
export async function getLatestRadarFrame(): Promise<RadarFrame | null> {
	const maps = await fetchWeatherMaps();
	if (!maps?.radar?.past?.length) return null;

	return maps.radar.past[maps.radar.past.length - 1];
}

/**
 * Build tile URL for satellite IR imagery
 * Format: https://tilecache.rainviewer.com{path}/256/{z}/{x}/{y}/0/0_0.png
 *
 * @param path - Frame path from RainViewer API
 * @param z - Zoom level (0-6 typically, 2-3 recommended for global view)
 * @param x - Tile X coordinate
 * @param y - Tile Y coordinate
 */
export function buildSatelliteTileUrl(path: string, z: number, x: number, y: number): string {
	// Satellite IR uses color scheme 0 with smooth rendering
	return `https://tilecache.rainviewer.com${path}/256/${z}/${x}/${y}/0/0_0.png`;
}

/**
 * Build tile URL for radar imagery
 * Format: https://tilecache.rainviewer.com{path}/256/{z}/{x}/{y}/{color}/{options}.png
 *
 * @param path - Frame path from RainViewer API
 * @param z - Zoom level
 * @param x - Tile X coordinate
 * @param y - Tile Y coordinate
 * @param colorScheme - Color scheme (1-8, default 6 = original)
 */
export function buildRadarTileUrl(
	path: string,
	z: number,
	x: number,
	y: number,
	colorScheme = 6
): string {
	// Options: 1_1 = smooth + snow
	return `https://tilecache.rainviewer.com${path}/256/${z}/${x}/${y}/${colorScheme}/1_1.png`;
}

/**
 * Convert longitude/latitude to Mercator tile coordinates
 * Standard Web Mercator (EPSG:3857) tile math
 */
export function lonLatToTile(lon: number, lat: number, zoom: number): { x: number; y: number } {
	const n = Math.pow(2, zoom);
	const x = Math.floor(((lon + 180) / 360) * n);
	const latRad = (lat * Math.PI) / 180;
	const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
	return { x: Math.max(0, Math.min(n - 1, x)), y: Math.max(0, Math.min(n - 1, y)) };
}

/**
 * Convert tile coordinates back to longitude/latitude bounds
 * Returns the NW corner of the tile
 */
export function tileToLonLat(x: number, y: number, zoom: number): { lon: number; lat: number } {
	const n = Math.pow(2, zoom);
	const lon = (x / n) * 360 - 180;
	const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
	const lat = (latRad * 180) / Math.PI;
	return { lon, lat };
}

/**
 * Get tile bounds (NW and SE corners)
 */
export function getTileBounds(
	x: number,
	y: number,
	zoom: number
): { north: number; south: number; east: number; west: number } {
	const nw = tileToLonLat(x, y, zoom);
	const se = tileToLonLat(x + 1, y + 1, zoom);
	return {
		north: nw.lat,
		south: se.lat,
		east: se.lon,
		west: nw.lon
	};
}

export interface TileInfo {
	x: number;
	y: number;
	z: number;
	bounds: { north: number; south: number; east: number; west: number };
}

/**
 * Get all tiles needed to cover a geographic bounding box at a given zoom level
 */
export function getTilesForBounds(
	west: number,
	south: number,
	east: number,
	north: number,
	zoom: number
): TileInfo[] {
	const tiles: TileInfo[] = [];

	// Clamp latitude to Mercator limits
	const clampedNorth = Math.min(north, 85.0511);
	const clampedSouth = Math.max(south, -85.0511);

	// Get tile range
	const nwTile = lonLatToTile(west, clampedNorth, zoom);
	const seTile = lonLatToTile(east, clampedSouth, zoom);

	// Handle wrap-around at date line
	const n = Math.pow(2, zoom);

	for (let y = nwTile.y; y <= seTile.y; y++) {
		// Handle horizontal wrap
		if (west <= east) {
			// Normal case
			for (let x = nwTile.x; x <= seTile.x; x++) {
				tiles.push({
					x,
					y,
					z: zoom,
					bounds: getTileBounds(x, y, zoom)
				});
			}
		} else {
			// Crosses date line
			for (let x = nwTile.x; x < n; x++) {
				tiles.push({
					x,
					y,
					z: zoom,
					bounds: getTileBounds(x, y, zoom)
				});
			}
			for (let x = 0; x <= seTile.x; x++) {
				tiles.push({
					x,
					y,
					z: zoom,
					bounds: getTileBounds(x, y, zoom)
				});
			}
		}
	}

	return tiles;
}

/**
 * Format satellite data timestamp for display
 */
export function formatWeatherTime(unixTimestamp: number): string {
	const date = new Date(unixTimestamp * 1000);
	return date.toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
}

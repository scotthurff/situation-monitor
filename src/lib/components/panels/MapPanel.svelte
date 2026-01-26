<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import {
		HOTSPOTS,
		// CONFLICT_ZONES available but not rendered - see comment in initMap
		CHOKEPOINTS,
		CABLE_LANDINGS,
		NUCLEAR_SITES,
		MILITARY_BASES,
		OCEANS,
		SANCTIONED_COUNTRY_IDS,
		THREAT_COLORS,
		WEATHER_CODES
	} from '$lib/config/map';
	import { newsStore, mapMarkerStore } from '$lib/stores';
	import type { DynamicMarker } from '$lib/types';

	interface Props {
		loading?: boolean;
		error?: string | null;
		fillContainer?: boolean;
	}

	let { loading = false, error = null, fillContainer = false }: Props = $props();

	// Track dynamic markers for reactive updates
	let dynamicMarkersGroup: ReturnType<typeof import('d3').select> | null = null;

	let mapContainer: HTMLDivElement;
	let containerWidth = $state(0);
	let containerHeight = $state(0);
	/* eslint-disable @typescript-eslint/no-explicit-any */
	let d3Module: typeof import('d3') | null = null;
	let svg: any = null;
	let mapGroup: any = null;
	let projection: any = null;
	let path: any = null;
	let zoom: any = null;
	/* eslint-enable @typescript-eslint/no-explicit-any */

	const WIDTH = 800;
	const HEIGHT = 400;

	// Tooltip state
	let tooltipContent = $state<{
		title: string;
		color: string;
		lines: string[];
	} | null>(null);
	let tooltipPosition = $state({ left: 0, top: 0 });
	let tooltipVisible = $state(false);
	let currentTooltipKey = $state<string | null>(null); // Track which location's tooltip is active

	// Weather widget state
	interface CityWeather {
		city: string;
		temp: number | null;
		condition: string;
		loading: boolean;
	}
	let cityWeather = $state<CityWeather[]>([
		{ city: 'DC', temp: null, condition: '—', loading: true },
		{ city: 'London', temp: null, condition: '—', loading: true },
		{ city: 'Beijing', temp: null, condition: '—', loading: true },
		{ city: 'Tokyo', temp: null, condition: '—', loading: true }
	]);

	// Weather widget city coordinates
	const WEATHER_CITIES = [
		{ city: 'DC', lat: 38.9, lon: -77.0 },
		{ city: 'London', lat: 51.5, lon: -0.1 },
		{ city: 'Beijing', lat: 39.9, lon: 116.4 },
		{ city: 'Tokyo', lat: 35.7, lon: 139.7 }
	];

	async function loadWeatherWidget(): Promise<void> {
		for (let i = 0; i < WEATHER_CITIES.length; i++) {
			const { city, lat, lon } = WEATHER_CITIES[i];
			const weather = await getWeather(lat, lon);
			if (weather) {
				cityWeather[i] = {
					city,
					temp: weather.temp,
					condition: weather.condition,
					loading: false
				};
			} else {
				cityWeather[i] = { ...cityWeather[i], loading: false };
			}
		}
	}

	// Weather layer state - satellite (global) + radar (where available)
	let satellitePath = $state<string | null>(null);
	let radarPath = $state<string | null>(null);
	let weatherEnabled = $state(true);

	// Tile configuration - zoom level 2 for better coverage (16 tiles each layer)
	const WEATHER_ZOOM = 2;
	const WEATHER_TILE_SIZE = 256;
	const WEATHER_TILES_PER_ROW = Math.pow(2, WEATHER_ZOOM); // 4 tiles per row at zoom 2

	async function loadRadarData(): Promise<void> {
		try {
			const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
			const data = await res.json();

			// Get satellite data (global cloud/precipitation coverage)
			const satFrames = data.satellite?.infrared || [];
			if (satFrames.length > 0) {
				satellitePath = satFrames[satFrames.length - 1].path;
			}

			// Get radar data (detailed precipitation where stations exist)
			const radarFrames = data.radar?.past || [];
			if (radarFrames.length > 0) {
				radarPath = radarFrames[radarFrames.length - 1].path;
			}

			// Render both layers
			renderWeatherTiles();
		} catch (err) {
			console.warn('Failed to load weather data:', err);
		}
	}

	// Generate tile URLs
	function getSatelliteTileUrl(x: number, y: number): string {
		if (!satellitePath) return '';
		// Satellite infrared - color 0 (grayscale), smooth
		return `https://tilecache.rainviewer.com${satellitePath}/${WEATHER_TILE_SIZE}/${WEATHER_ZOOM}/${x}/${y}/0/0_0.png`;
	}

	function getRadarTileUrl(x: number, y: number): string {
		if (!radarPath) return '';
		// Radar - color 2 (TITAN - blue/pink/yellow like Apple), smooth + snow
		return `https://tilecache.rainviewer.com${radarPath}/${WEATHER_TILE_SIZE}/${WEATHER_ZOOM}/${x}/${y}/2/1_1.png`;
	}

	// Convert tile coordinates to lat/lon bounds (Web Mercator)
	function tile2lon(x: number, z: number): number {
		return (x / Math.pow(2, z)) * 360 - 180;
	}

	function tile2lat(y: number, z: number): number {
		const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
		return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
	}

	// Render weather tiles inside SVG for proper zoom sync
	function renderWeatherTiles(): void {
		if (!mapGroup || !d3Module || !projection) return;

		// Remove existing weather tiles
		mapGroup.selectAll('.weather-group').remove();

		// Create weather group as first child (behind everything else)
		const weatherGroup = mapGroup.insert('g', ':first-child')
			.attr('class', 'weather-group');

		// Render a single tile with proper projection
		function renderTile(
			group: ReturnType<typeof d3Module.select>,
			tx: number,
			ty: number,
			tileUrl: string
		): void {
			// Get tile bounds in lat/lon
			const west = tile2lon(tx, WEATHER_ZOOM);
			const east = tile2lon(tx + 1, WEATHER_ZOOM);
			const north = tile2lat(ty, WEATHER_ZOOM);
			const south = tile2lat(ty + 1, WEATHER_ZOOM);

			// Project corners to SVG coordinates
			const topLeft = projection([west, north]);
			const bottomRight = projection([east, south]);

			if (!topLeft || !bottomRight) return;

			const x = topLeft[0];
			const y = topLeft[1];
			const width = bottomRight[0] - topLeft[0];
			const height = bottomRight[1] - topLeft[1];

			// Skip tiles that are outside our visible area
			if (x + width < 0 || x > WIDTH || y + height < 0 || y > HEIGHT) return;

			group.append('image')
				.attr('href', tileUrl)
				.attr('x', x)
				.attr('y', y)
				.attr('width', width)
				.attr('height', height)
				.attr('preserveAspectRatio', 'none');
		}

		// Layer 1: Satellite infrared (global cloud coverage) - base layer
		if (satellitePath) {
			const satGroup = weatherGroup.append('g')
				.attr('class', 'satellite-layer')
				.attr('opacity', 0.5);

			for (let ty = 0; ty < WEATHER_TILES_PER_ROW; ty++) {
				for (let tx = 0; tx < WEATHER_TILES_PER_ROW; tx++) {
					renderTile(satGroup, tx, ty, getSatelliteTileUrl(tx, ty));
				}
			}
		}

		// Layer 2: Radar precipitation (detailed where available) - overlay
		if (radarPath) {
			const radarGroup = weatherGroup.append('g')
				.attr('class', 'radar-layer')
				.attr('opacity', 0.8)
				.style('mix-blend-mode', 'screen');

			for (let ty = 0; ty < WEATHER_TILES_PER_ROW; ty++) {
				for (let tx = 0; tx < WEATHER_TILES_PER_ROW; tx++) {
					renderTile(radarGroup, tx, ty, getRadarTileUrl(tx, ty));
				}
			}
		}
	}

	// Track current zoom transform for radar layer synchronization
	let currentTransform = $state({ x: 0, y: 0, k: 1 });

	// Weather cache
	interface CacheEntry<T> {
		data: T;
		timestamp: number;
	}
	const dataCache: Record<string, CacheEntry<unknown>> = {};

	function getCachedData<T>(key: string): T | null {
		const entry = dataCache[key] as CacheEntry<T> | undefined;
		if (!entry) return null;
		if (Date.now() - entry.timestamp > 600000) {
			delete dataCache[key];
			return null;
		}
		return entry.data;
	}

	function setCachedData<T>(key: string, data: T): void {
		dataCache[key] = { data, timestamp: Date.now() };
	}

	function getLocalTime(lon: number): string {
		const now = new Date();
		const utcHours = now.getUTCHours();
		const utcMinutes = now.getUTCMinutes();
		const offsetHours = Math.round(lon / 15);
		let localHours = (utcHours + offsetHours + 24) % 24;
		const ampm = localHours >= 12 ? 'PM' : 'AM';
		localHours = localHours % 12 || 12;
		return `${localHours}:${utcMinutes.toString().padStart(2, '0')} ${ampm}`;
	}

	interface WeatherResult {
		temp: number | null;
		wind: number | null;
		condition: string;
	}

	async function getWeather(lat: number, lon: number): Promise<WeatherResult | null> {
		const key = `weather_${lat}_${lon}`;
		const cached = getCachedData<WeatherResult>(key);
		if (cached) return cached;

		try {
			const res = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`
			);
			const data = await res.json();
			const temp = data.current?.temperature_2m;
			const tempF = temp ? Math.round((temp * 9) / 5 + 32) : null;
			const wind = data.current?.wind_speed_10m;
			const code = data.current?.weather_code;
			const result: WeatherResult = {
				temp: tempF,
				wind: wind ? Math.round(wind) : null,
				condition: WEATHER_CODES[code] || '—'
			};
			setCachedData(key, result);
			return result;
		} catch {
			return null;
		}
	}

	function enableZoom(): void {
		if (!svg || !zoom) return;
		svg.call(zoom);
	}

	function calculateTerminator(): [number, number][] {
		const now = new Date();
		const dayOfYear = Math.floor(
			(now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
		);
		const declination = -23.45 * Math.cos(((360 / 365) * (dayOfYear + 10) * Math.PI) / 180);
		const hourAngle = (now.getUTCHours() + now.getUTCMinutes() / 60) * 15 - 180;

		const terminatorPoints: [number, number][] = [];
		for (let lat = -90; lat <= 90; lat += 2) {
			const tanDec = Math.tan((declination * Math.PI) / 180);
			const tanLat = Math.tan((lat * Math.PI) / 180);
			let lon = -hourAngle + (Math.acos(-tanDec * tanLat) * 180) / Math.PI;
			if (isNaN(lon)) lon = lat * declination > 0 ? -hourAngle + 180 : -hourAngle;
			terminatorPoints.push([lon, lat]);
		}
		for (let lat = 90; lat >= -90; lat -= 2) {
			const tanDec = Math.tan((declination * Math.PI) / 180);
			const tanLat = Math.tan((lat * Math.PI) / 180);
			let lon = -hourAngle - (Math.acos(-tanDec * tanLat) * 180) / Math.PI;
			if (isNaN(lon)) lon = lat * declination > 0 ? -hourAngle - 180 : -hourAngle;
			terminatorPoints.push([lon, lat]);
		}
		return terminatorPoints;
	}

	function showTooltip(
		event: MouseEvent,
		title: string,
		color: string,
		lines: string[] = []
	): void {
		if (!mapContainer) return;
		const rect = mapContainer.getBoundingClientRect();
		tooltipContent = { title, color, lines };
		tooltipPosition = {
			left: event.clientX - rect.left + 15,
			top: event.clientY - rect.top - 10
		};
		tooltipVisible = true;
	}

	function moveTooltip(event: MouseEvent): void {
		if (!mapContainer) return;
		const rect = mapContainer.getBoundingClientRect();
		tooltipPosition = {
			left: event.clientX - rect.left + 15,
			top: event.clientY - rect.top - 10
		};
	}

	function hideTooltip(): void {
		tooltipVisible = false;
		tooltipContent = null;
		currentTooltipKey = null;
	}

	async function showEnhancedTooltip(
		event: MouseEvent,
		_name: string,
		lat: number,
		lon: number,
		desc: string,
		color: string
	): Promise<void> {
		const tooltipKey = `${lat},${lon}`; // Unique key for this location
		currentTooltipKey = tooltipKey;

		const localTime = getLocalTime(lon);
		const lines = [`Local: ${localTime}`];
		showTooltip(event, desc, color, lines);

		const weather = await getWeather(lat, lon);
		// Only update if this is still the active tooltip (prevents race conditions)
		if (weather && tooltipVisible && currentTooltipKey === tooltipKey) {
			tooltipContent = {
				title: desc,
				color,
				lines: [
					`Local: ${localTime}`,
					`${weather.condition} ${weather.temp}°F, ${weather.wind}mph`
				]
			};
		}
	}

	// Severity to color mapping for dynamic markers
	const SEVERITY_COLORS: Record<string, string> = {
		critical: '#ff0000',
		high: '#ff4444',
		medium: '#ffcc00',
		low: '#00ff88'
	};

	// Check if a marker is near a static hotspot (within ~1 degree)
	function isNearStaticHotspot(lat: number, lon: number): boolean {
		const threshold = 1.5; // degrees
		return HOTSPOTS.some(
			(h) => Math.abs(h.lat - lat) < threshold && Math.abs(h.lon - lon) < threshold
		);
	}

	/**
	 * Render dynamic news-driven markers
	 * Uses D3 data join for enter/update/exit pattern
	 */
	function renderDynamicMarkers(): void {
		if (!dynamicMarkersGroup || !projection || !d3Module) return;

		// Filter out markers that overlap with static hotspots (by proximity)
		const markers = mapMarkerStore.markers.filter(
			(m) => !isNearStaticHotspot(m.lat, m.lon)
		);
		const d3 = d3Module;

		// Data join for marker groups
		const markerGroups = dynamicMarkersGroup
			.selectAll<SVGGElement, DynamicMarker>('.dynamic-marker')
			.data(markers, (d: DynamicMarker) => d.id);

		// EXIT: Remove old markers with fade out
		markerGroups.exit().transition().duration(300).style('opacity', 0).remove();

		// ENTER: Create new markers
		const enterGroups = markerGroups
			.enter()
			.append('g')
			.attr('class', 'dynamic-marker')
			.style('opacity', 0);

		// Add pulsing outer circle (news indicator) - smaller to avoid overlap
		enterGroups
			.append('circle')
			.attr('class', 'dynamic-pulse')
			.attr('r', (d: DynamicMarker) => Math.min(3 + d.count * 0.3, 6))
			.attr('fill', (d: DynamicMarker) => SEVERITY_COLORS[d.severity] || '#00ff88')
			.attr('fill-opacity', 0.25);

		// Add inner dot - smaller
		enterGroups
			.append('circle')
			.attr('class', 'dynamic-inner')
			.attr('r', (d: DynamicMarker) => Math.min(1.5 + d.count * 0.2, 3))
			.attr('fill', (d: DynamicMarker) => SEVERITY_COLORS[d.severity] || '#00ff88');

		// Add location label (like static hotspots)
		enterGroups
			.append('text')
			.attr('class', 'dynamic-label')
			.attr('x', 8)
			.attr('y', 3)
			.attr('fill', (d: DynamicMarker) => SEVERITY_COLORS[d.severity] || '#00ff88')
			.attr('font-size', '5px')
			.attr('font-family', 'monospace')
			.text((d: DynamicMarker) => d.name.toUpperCase());

		// Add hit area for tooltip
		enterGroups
			.append('circle')
			.attr('class', 'dynamic-hit')
			.attr('r', 6)
			.attr('fill', 'transparent')
			.style('cursor', 'pointer');

		// ENTER + UPDATE: Position all markers
		const allGroups = enterGroups.merge(markerGroups);

		allGroups.attr('transform', (d: DynamicMarker) => {
			const [x, y] = projection([d.lon, d.lat]) || [0, 0];
			return `translate(${x},${y})`;
		});

		// Update sizes based on count
		allGroups
			.select('.dynamic-pulse')
			.attr('r', (d: DynamicMarker) => Math.min(3 + d.count * 0.3, 6))
			.attr('fill', (d: DynamicMarker) => SEVERITY_COLORS[d.severity] || '#00ff88');

		allGroups
			.select('.dynamic-inner')
			.attr('r', (d: DynamicMarker) => Math.min(1.5 + d.count * 0.2, 3))
			.attr('fill', (d: DynamicMarker) => SEVERITY_COLORS[d.severity] || '#00ff88');

		// Fade in new markers
		enterGroups.transition().duration(300).style('opacity', 1);

		// Add tooltip handlers - bind data directly to hit area and label
		allGroups.each(function(d: DynamicMarker) {
			const group = d3.select(this);
			const hitArea = group.select('.dynamic-hit');
			const label = group.select('.dynamic-label');

			const handleMouseEnter = (event: MouseEvent) => {
				const color = SEVERITY_COLORS[d.severity] || '#00ff88';
				const itemCount = d.items.length;
				const lines = [
					`${d.count} mention${d.count > 1 ? 's' : ''} in news`,
					`Last: ${formatTimeAgo(d.lastSeen)}`
				];
				// Add first few news headlines
				d.items.slice(0, 3).forEach((item) => {
					const title = item.title.length > 40 ? item.title.slice(0, 40) + '...' : item.title;
					lines.push(`• ${title}`);
				});
				if (itemCount > 3) {
					lines.push(`+${itemCount - 3} more`);
				}
				showTooltip(event, d.name.toUpperCase(), color, lines);
			};

			hitArea
				.on('mouseenter', handleMouseEnter)
				.on('mousemove', moveTooltip)
				.on('mouseleave', hideTooltip);

			label
				.style('cursor', 'pointer')
				.on('mouseenter', handleMouseEnter)
				.on('mousemove', moveTooltip)
				.on('mouseleave', hideTooltip);
		});
	}

	/**
	 * Format time ago string
	 */
	function formatTimeAgo(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays}d ago`;
	}

	// Track last processed news count to avoid re-processing
	let lastNewsCount = 0;
	let lastMarkerCount = 0;

	// Reactive effect: refresh markers when news changes (with guard)
	$effect(() => {
		const newsItems = newsStore.news;
		const currentCount = newsItems.length;

		// Only refresh if news count actually changed
		if (currentCount > 0 && currentCount !== lastNewsCount) {
			lastNewsCount = currentCount;
			// Use setTimeout to avoid blocking the main thread
			setTimeout(() => {
				mapMarkerStore.refresh(newsItems);
			}, 100);
		}
	});

	// Reactive effect: re-render when markers change (with guard)
	$effect(() => {
		const markers = mapMarkerStore.markers;
		const currentMarkerCount = markers.length;

		// Only re-render if marker count changed and we're initialized
		if (dynamicMarkersGroup && projection && d3Module && currentMarkerCount !== lastMarkerCount) {
			lastMarkerCount = currentMarkerCount;
			renderDynamicMarkers();
		}
	});

	async function initMap(): Promise<void> {
		const d3 = await import('d3');
		d3Module = d3;
		const topojson = await import('topojson-client');

		const svgEl = mapContainer.querySelector('svg');
		if (!svgEl) return;

		svg = d3.select(svgEl);
		svg.attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
		// fillContainer mode: scale to fill container, cropping excess (for mobile portrait)
		if (fillContainer) {
			svg.attr('preserveAspectRatio', 'xMidYMid slice');
		}

		mapGroup = svg.append('g').attr('id', 'mapGroup');

		zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([1, 6])
			.filter((event) => {
				if (event.type === 'wheel') return false;
				if (event.type.startsWith('touch')) return true;
				if (event.type === 'mousedown' || event.type === 'mousemove') return true;
				if (event.type === 'dblclick') return false;
				return true;
			})
			.on('zoom', (event) => {
				mapGroup.attr('transform', event.transform.toString());
				// Update transform state for radar layer synchronization
				currentTransform = { x: event.transform.x, y: event.transform.y, k: event.transform.k };
			});

		enableZoom();

		// Web Mercator projection - aligns with standard radar/weather tiles
		projection = d3
			.geoMercator()
			.scale(125)
			.center([0, 15])
			.translate([WIDTH / 2, HEIGHT / 2]);

		path = d3.geoPath().projection(projection);

		try {
			const response = await fetch(
				'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
			);
			const world = await response.json();
			const countries = topojson.feature(
				world,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				world.objects.countries as any
			) as unknown as GeoJSON.FeatureCollection;

			// Draw countries
			mapGroup
				.selectAll('path.country')
				.data(countries.features)
				.enter()
				.append('path')
				.attr('class', 'country')
				.attr('d', path as unknown as string)
				.attr('fill', (d: GeoJSON.Feature) =>
					SANCTIONED_COUNTRY_IDS.includes(+(d.id || 0)) ? '#2a1a1a' : '#0f3028'
				)
				.attr('stroke', (d: GeoJSON.Feature) =>
					SANCTIONED_COUNTRY_IDS.includes(+(d.id || 0)) ? '#4a2020' : '#1a5040'
				)
				.attr('stroke-width', 0.5);

			// Draw graticule
			const graticule = d3.geoGraticule().step([30, 30]);
			mapGroup
				.append('path')
				.datum(graticule)
				.attr('d', path as unknown as string)
				.attr('fill', 'none')
				.attr('stroke', '#1a3830')
				.attr('stroke-width', 0.3)
				.attr('stroke-dasharray', '2,2');

			// Draw ocean labels
			OCEANS.forEach((o) => {
				const [x, y] = projection([o.lon, o.lat]) || [0, 0];
				if (x && y) {
					mapGroup
						.append('text')
						.attr('x', x)
						.attr('y', y)
						.attr('fill', '#1a4a40')
						.attr('font-size', '6px')
						.attr('font-family', 'monospace')
						.attr('text-anchor', 'middle')
						.attr('opacity', 0.6)
						.text(o.name);
				}
			});

			// Draw day/night terminator
			const terminatorPoints = calculateTerminator();
			mapGroup
				.append('path')
				.datum({ type: 'Polygon', coordinates: [terminatorPoints] } as GeoJSON.Polygon)
				.attr('d', path as unknown as string)
				.attr('fill', 'rgba(0,0,0,0.3)')
				.attr('stroke', 'none');

			// Conflict zones available in CONFLICT_ZONES config but not rendered
			// To re-enable: iterate CONFLICT_ZONES and draw polygons with fill-opacity 0.15

			// Draw chokepoints
			CHOKEPOINTS.forEach((cp) => {
				const [x, y] = projection([cp.lon, cp.lat]) || [0, 0];
				if (x && y) {
					mapGroup
						.append('rect')
						.attr('x', x - 2.5)
						.attr('y', y - 2.5)
						.attr('width', 5)
						.attr('height', 5)
						.attr('fill', '#00aaff')
						.attr('opacity', 0.8)
						.attr('transform', `rotate(45,${x},${y})`);
					mapGroup
						.append('text')
						.attr('x', x + 8)
						.attr('y', y + 3)
						.attr('fill', '#00aaff')
						.attr('font-size', '5px')
						.attr('font-family', 'monospace')
						.style('cursor', 'pointer')
						.text(cp.name.toUpperCase())
						.on('mouseenter', (event: MouseEvent) => showTooltip(event, cp.desc, '#00aaff'))
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 6)
						.attr('fill', 'transparent')
						.attr('class', 'hotspot-hit')
						.on('mouseenter', (event: MouseEvent) => showTooltip(event, cp.desc, '#00aaff'))
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});

			// Draw cable landings
			CABLE_LANDINGS.forEach((cl) => {
				const [x, y] = projection([cl.lon, cl.lat]) || [0, 0];
				if (x && y) {
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 3)
						.attr('fill', 'none')
						.attr('stroke', '#aa44ff')
						.attr('stroke-width', 1.5);
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 6)
						.attr('fill', 'transparent')
						.attr('class', 'hotspot-hit')
						.on('mouseenter', (event: MouseEvent) => showTooltip(event, cl.desc, '#aa44ff'))
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});

			// Draw nuclear sites
			NUCLEAR_SITES.forEach((ns) => {
				const [x, y] = projection([ns.lon, ns.lat]) || [0, 0];
				if (x && y) {
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 2)
						.attr('fill', '#ffff00');
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 5)
						.attr('fill', 'none')
						.attr('stroke', '#ffff00')
						.attr('stroke-width', 1)
						.attr('stroke-dasharray', '3,3');
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 6)
						.attr('fill', 'transparent')
						.attr('class', 'hotspot-hit')
						.on('mouseenter', (event: MouseEvent) => showTooltip(event, ns.desc, '#ffff00'))
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});

			// Draw military bases
			MILITARY_BASES.forEach((mb) => {
				const [x, y] = projection([mb.lon, mb.lat]) || [0, 0];
				if (x && y) {
					const starPath = `M${x},${y - 3} L${x + 1},${y - 1} L${x + 3},${y - 1} L${x + 1.5},${y + 0.5} L${x + 2},${y + 3} L${x},${y + 1.5} L${x - 2},${y + 3} L${x - 1.5},${y + 0.5} L${x - 3},${y - 1} L${x - 1},${y - 1} Z`;
					mapGroup.append('path').attr('d', starPath).attr('fill', '#ff00ff').attr('opacity', 0.8);
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 6)
						.attr('fill', 'transparent')
						.attr('class', 'hotspot-hit')
						.on('mouseenter', (event: MouseEvent) => showTooltip(event, mb.desc, '#ff00ff'))
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});

			// Draw hotspots
			HOTSPOTS.forEach((h) => {
				const [x, y] = projection([h.lon, h.lat]) || [0, 0];
				if (x && y) {
					const color = THREAT_COLORS[h.level];
					// Pulsing circle
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 6)
						.attr('fill', color)
						.attr('fill-opacity', 0.3)
						.attr('class', 'pulse');
					// Inner dot
					mapGroup.append('circle').attr('cx', x).attr('cy', y).attr('r', 3).attr('fill', color);
					// Label
					mapGroup
						.append('text')
						.attr('x', x + 8)
						.attr('y', y + 3)
						.attr('fill', color)
						.attr('font-size', '5px')
						.attr('font-family', 'monospace')
						.style('cursor', 'pointer')
						.text(h.name.toUpperCase())
						.on('mouseenter', (event: MouseEvent) =>
							showEnhancedTooltip(event, h.name, h.lat, h.lon, h.desc, color)
						)
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
					// Hit area
					mapGroup
						.append('circle')
						.attr('cx', x)
						.attr('cy', y)
						.attr('r', 6)
						.attr('fill', 'transparent')
						.attr('class', 'hotspot-hit')
						.on('mouseenter', (event: MouseEvent) =>
							showEnhancedTooltip(event, h.name, h.lat, h.lon, h.desc, color)
						)
						.on('mousemove', moveTooltip)
						.on('mouseleave', hideTooltip);
				}
			});

			// Create dynamic markers group (layered on top of static markers)
			dynamicMarkersGroup = mapGroup.append('g').attr('id', 'dynamicMarkers');

			// Initial render of dynamic markers
			renderDynamicMarkers();
		} catch (err) {
			console.error('Failed to load map data:', err);
		}
	}

	function zoomIn(): void {
		if (!svg || !zoom) return;
		svg.transition().duration(300).call(zoom.scaleBy, 1.5);
	}

	function zoomOut(): void {
		if (!svg || !zoom) return;
		svg
			.transition()
			.duration(300)
			.call(zoom.scaleBy, 1 / 1.5);
	}

	function resetZoom(): void {
		if (!svg || !zoom || !d3Module) return;
		svg.transition().duration(300).call(zoom.transform, d3Module.zoomIdentity);
	}

	onMount(async () => {
		await initMap();
		loadWeatherWidget();
		loadRadarData();
	});
</script>

<Panel id="map" title="Global Situation" {loading} {error}>
	<div class="map-container" bind:this={mapContainer} bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
		<!-- Cloud/satellite layer from RainViewer infrared satellite imagery -->
		<!-- Radar tiles are now rendered inside the SVG mapGroup for proper zoom sync -->
		<svg class="map-svg"></svg>
		{#if tooltipVisible && tooltipContent}
			<div
				class="map-tooltip"
				style="left: {tooltipPosition.left}px; top: {tooltipPosition.top}px;"
			>
				<strong style="color: {tooltipContent.color}">{tooltipContent.title}</strong>
				{#each tooltipContent.lines as line}
					<br /><span class="tooltip-line">{line}</span>
				{/each}
			</div>
		{/if}
		<div class="zoom-controls">
			<button class="zoom-btn" onclick={zoomIn} title="Zoom in">+</button>
			<button class="zoom-btn" onclick={zoomOut} title="Zoom out">−</button>
			<button class="zoom-btn" onclick={resetZoom} title="Reset">⟲</button>
		</div>
		<div class="weather-widget">
			{#each cityWeather as weather}
				<div class="weather-item">
					<span class="weather-city">{weather.city}</span>
					{#if weather.loading}
						<span class="weather-loading">...</span>
					{:else}
						<span class="weather-temp">{weather.temp !== null ? `${weather.temp}°` : '—'}</span>
						<span class="weather-condition">{weather.condition}</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</Panel>

<style>
	.map-container {
		position: relative;
		width: 100%;
		aspect-ratio: 2 / 1;
		background: #0a0f0d;
		border-radius: 4px;
		overflow: hidden;
		isolation: isolate; /* Create stacking context for proper z-index */
	}

	.map-svg {
		width: 100%;
		height: 100%;
		position: relative;
		z-index: 1;
	}

	/* Radar tiles are rendered inside SVG - styling applied via D3 */

	.map-tooltip {
		position: absolute;
		background: rgba(10, 10, 10, 0.95);
		border: 1px solid #333;
		border-radius: 4px;
		padding: 0.5rem;
		font-size: 0.65rem;
		color: #ddd;
		max-width: 250px;
		pointer-events: none;
		z-index: 10;
	}

	.tooltip-line {
		opacity: 0.7;
	}

	.zoom-controls {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		z-index: 5;
	}

	.zoom-btn {
		width: 1.75rem;
		height: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(20, 20, 20, 0.9);
		border: 1px solid #333;
		border-radius: 4px;
		color: #aaa;
		font-size: 1rem;
		cursor: pointer;
	}

	.zoom-btn:hover {
		background: rgba(40, 40, 40, 0.9);
		color: #fff;
	}

	/* Weather widget */
	.weather-widget {
		position: absolute;
		bottom: 0.5rem;
		left: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		background: rgba(10, 10, 10, 0.85);
		border: 1px solid #333;
		border-radius: 4px;
		padding: 0.35rem 0.5rem;
		font-size: 0.55rem;
		font-family: 'SF Mono', 'JetBrains Mono', monospace;
		z-index: 5;
	}

	.weather-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.weather-city {
		color: var(--text-muted);
		width: 3rem;
	}

	.weather-temp {
		color: var(--text);
		width: 2rem;
		text-align: right;
	}

	.weather-condition {
		color: var(--text-dim);
		font-size: 0.5rem;
	}

	.weather-loading {
		color: var(--text-muted);
		opacity: 0.6;
	}

	/* Pulse animation for hotspots */
	:global(.pulse) {
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			r: 6;
			opacity: 0.3;
		}
		50% {
			r: 10;
			opacity: 0.1;
		}
	}

	:global(.hotspot-hit) {
		cursor: pointer;
	}

	/* Dynamic marker animations */
	:global(.dynamic-pulse) {
		animation: dynamic-pulse 2s ease-in-out infinite;
	}

	@keyframes dynamic-pulse {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.15;
			transform: scale(1.5);
		}
	}

	:global(.dynamic-hit) {
		cursor: pointer;
	}
</style>

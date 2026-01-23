<script lang="ts">
	import { MobileView } from '$lib/components/layout';
	import { MapPanel } from '$lib/components/panels';
	import { mapMarkerStore } from '$lib/stores';

	let showLegend = $state(false);

	const markerCount = $derived(mapMarkerStore.markers.length);
	const criticalCount = $derived(
		mapMarkerStore.markers.filter((m) => m.severity === 'critical' || m.severity === 'high').length
	);

	function toggleLegend() {
		showLegend = !showLegend;
	}
</script>

<MobileView noPadding>
	<div class="map-wrapper">
		<!-- Stats bar -->
		<div class="map-stats">
			<button class="legend-toggle" onclick={toggleLegend} aria-expanded={showLegend}>
				<span class="legend-icon">🗺️</span>
				<span class="legend-label">Legend</span>
				<span class="legend-arrow">{showLegend ? '▲' : '▼'}</span>
			</button>
			<div class="stats-right">
				{#if criticalCount > 0}
					<span class="stat critical">{criticalCount} alert{criticalCount !== 1 ? 's' : ''}</span>
				{/if}
				{#if markerCount > 0}
					<span class="stat">{markerCount} active</span>
				{/if}
			</div>
		</div>

		<!-- Collapsible legend -->
		{#if showLegend}
			<div class="map-legend">
				<div class="legend-section">
					<div class="legend-title">Static Markers</div>
					<div class="legend-items">
						<div class="legend-item">
							<span class="legend-marker hotspot-critical"></span>
							<span>Critical Hotspot</span>
						</div>
						<div class="legend-item">
							<span class="legend-marker hotspot-high"></span>
							<span>High Tension</span>
						</div>
						<div class="legend-item">
							<span class="legend-marker hotspot-medium"></span>
							<span>Medium Risk</span>
						</div>
						<div class="legend-item">
							<span class="legend-marker chokepoint"></span>
							<span>Chokepoint</span>
						</div>
						<div class="legend-item">
							<span class="legend-marker nuclear"></span>
							<span>Nuclear Site</span>
						</div>
						<div class="legend-item">
							<span class="legend-marker military"></span>
							<span>Military Base</span>
						</div>
						<div class="legend-item">
							<span class="legend-marker cable"></span>
							<span>Cable Landing</span>
						</div>
					</div>
				</div>
				<div class="legend-section">
					<div class="legend-title">News Markers</div>
					<div class="legend-items">
						<div class="legend-item">
							<span class="legend-marker news-critical"></span>
							<span>Critical News</span>
						</div>
						<div class="legend-item">
							<span class="legend-marker news-high"></span>
							<span>High Priority</span>
						</div>
						<div class="legend-item">
							<span class="legend-marker news-medium"></span>
							<span>Medium</span>
						</div>
						<div class="legend-item">
							<span class="legend-marker news-low"></span>
							<span>Low Priority</span>
						</div>
					</div>
				</div>
				<div class="legend-hint">
					Tap markers for details. Pinch to zoom. Drag to pan.
				</div>
			</div>
		{/if}

		<!-- Map -->
		<div class="map-container-wrapper">
			<MapPanel />
		</div>
	</div>
</MobileView>

<style>
	.map-wrapper {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: var(--bg);
	}

	.map-stats {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.legend-toggle {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.5rem;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 0.375rem;
		color: var(--text);
		font-size: 0.7rem;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.legend-toggle:active {
		background: var(--surface-hover);
	}

	.legend-icon {
		font-size: 0.85rem;
	}

	.legend-label {
		font-weight: 500;
	}

	.legend-arrow {
		font-size: 0.5rem;
		color: var(--text-muted);
	}

	.stats-right {
		display: flex;
		gap: 0.5rem;
	}

	.stat {
		font-size: 0.65rem;
		padding: 0.25rem 0.5rem;
		background: var(--bg);
		border-radius: 0.25rem;
		color: var(--text-dim);
	}

	.stat.critical {
		background: rgba(255, 68, 68, 0.15);
		color: var(--red);
	}

	.map-legend {
		padding: 0.75rem;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.legend-section {
		margin-bottom: 0.75rem;
	}

	.legend-section:last-of-type {
		margin-bottom: 0.5rem;
	}

	.legend-title {
		font-size: 0.6rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.375rem;
	}

	.legend-items {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.375rem 1rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.65rem;
		color: var(--text-dim);
	}

	.legend-marker {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* Static marker colors */
	.hotspot-critical { background: #ff0000; }
	.hotspot-high { background: #ff4444; }
	.hotspot-medium { background: #ffcc00; }
	.chokepoint {
		background: #00aaff;
		border-radius: 2px;
		transform: rotate(45deg);
		width: 10px;
		height: 10px;
	}
	.nuclear {
		background: #ffff00;
		box-shadow: 0 0 0 2px var(--surface), 0 0 0 3px #ffff00;
	}
	.military {
		background: #ff00ff;
		clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
		border-radius: 0;
	}
	.cable {
		background: transparent;
		border: 2px solid #aa44ff;
	}

	/* News marker colors */
	.news-critical { background: #ff0000; }
	.news-high { background: #ff4444; }
	.news-medium { background: #ffcc00; }
	.news-low { background: #00ff88; }

	.legend-hint {
		font-size: 0.6rem;
		color: var(--text-muted);
		font-style: italic;
		text-align: center;
		padding-top: 0.375rem;
		border-top: 1px solid var(--border);
	}

	.map-container-wrapper {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.map-container-wrapper :global(.panel) {
		height: 100%;
		display: flex;
		flex-direction: column;
		border-radius: 0;
		border: none;
	}

	.map-container-wrapper :global(.panel-header) {
		display: none;
	}

	.map-container-wrapper :global(.panel-content) {
		flex: 1;
		padding: 0;
	}

	.map-container-wrapper :global(.map-container) {
		aspect-ratio: unset;
		height: 100%;
	}

	/* Larger zoom controls for mobile */
	.map-container-wrapper :global(.zoom-controls) {
		bottom: 1rem;
		right: 1rem;
	}

	.map-container-wrapper :global(.zoom-btn) {
		width: 2.5rem;
		height: 2.5rem;
		font-size: 1.25rem;
	}
</style>

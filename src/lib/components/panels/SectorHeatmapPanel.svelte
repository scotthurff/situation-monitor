<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import { fetchSectorData } from '$lib/api/sectors';
	import type { SectorPerformance } from '$lib/types';

	let sectors: SectorPerformance[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	function getColorClass(change: number): string {
		if (change >= 2) return 'up-3';
		if (change >= 1) return 'up-2';
		if (change >= 0.5) return 'up-1';
		if (change >= 0) return 'up-0';
		if (change >= -0.5) return 'down-0';
		if (change >= -1) return 'down-1';
		if (change >= -2) return 'down-2';
		return 'down-3';
	}

	function formatChange(change: number): string {
		const sign = change >= 0 ? '+' : '';
		return sign + change.toFixed(2) + '%';
	}

	async function loadSectors() {
		loading = true;
		error = null;
		try {
			sectors = await fetchSectorData();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load sectors';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadSectors();
	});
</script>

<Panel id="heatmap" title="Sector Heatmap" icon="🗺️" {loading} {error}>
	{#if sectors.length === 0 && !loading && !error}
		<div class="empty-state">No sector data available</div>
	{:else}
		<div class="heatmap-grid">
			{#each sectors as sector (sector.symbol)}
				<div class="heatmap-cell {getColorClass(sector.changePercent)}">
					<div class="sector-name">{sector.name}</div>
					<div class="sector-change">{formatChange(sector.changePercent)}</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.heatmap-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.25rem;
	}

	.heatmap-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 4px;
		text-align: center;
		min-height: 3rem;
		transition: transform 0.15s ease;
	}

	.heatmap-cell:hover {
		transform: scale(1.02);
	}

	.sector-name {
		font-size: 0.6rem;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.sector-change {
		font-size: 0.55rem;
		font-weight: 500;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		margin-top: 0.2rem;
	}

	/* Color classes based on percent change */
	.up-3 {
		background: #00aa00;
	}
	.up-2 {
		background: #22bb22;
	}
	.up-1 {
		background: #55cc55;
	}
	.up-0 {
		background: #88dd88;
	}
	.down-0 {
		background: #dd8888;
	}
	.down-1 {
		background: #cc5555;
	}
	.down-2 {
		background: #bb2222;
	}
	.down-3 {
		background: #aa0000;
	}

	.empty-state {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.7rem;
		padding: 1rem;
	}

	@media (max-width: 400px) {
		.heatmap-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>

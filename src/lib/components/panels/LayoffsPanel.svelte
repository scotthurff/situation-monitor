<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import { fetchLayoffs } from '$lib/api/layoffs';
	import type { Layoff } from '$lib/types';

	let layoffs: Layoff[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	const totalLayoffs = $derived(layoffs.reduce((sum, l) => sum + l.count, 0));

	function formatCount(n: number): string {
		if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
		return n.toString();
	}

	function getSectorClass(sector: string): string {
		const sectorLower = sector.toLowerCase();
		if (sectorLower.includes('tech') || sectorLower.includes('software')) return 'sector-tech';
		if (sectorLower.includes('finance') || sectorLower.includes('bank')) return 'sector-finance';
		if (sectorLower.includes('energy')) return 'sector-energy';
		if (sectorLower.includes('media')) return 'sector-media';
		return 'sector-other';
	}

	async function loadLayoffs() {
		loading = true;
		error = null;
		try {
			layoffs = await fetchLayoffs();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load layoffs';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadLayoffs();
	});
</script>

<Panel id="layoffs" title="Layoffs Tracker" icon="📉" count={layoffs.length} {loading} {error}>
	{#snippet header()}
		{#if totalLayoffs > 0}
			<div class="total-layoffs">Total: {formatCount(totalLayoffs)} jobs</div>
		{/if}
	{/snippet}

	{#if layoffs.length === 0 && !loading && !error}
		<div class="empty-state">No layoff data available</div>
	{:else}
		<div class="layoffs-list">
			{#each layoffs as layoff (layoff.id)}
				{#if layoff.link}
					<a href={layoff.link} target="_blank" rel="noopener noreferrer" class="layoff-item layoff-link">
						<div class="layoff-header">
							<span class="layoff-company">{layoff.company}</span>
							<span class="layoff-count">-{formatCount(layoff.count)}</span>
						</div>
						<div class="layoff-details">
							<span class="layoff-sector {getSectorClass(layoff.sector)}">{layoff.sector}</span>
							<span class="layoff-source">{layoff.source}</span>
						</div>
					</a>
				{:else}
					<div class="layoff-item">
						<div class="layoff-header">
							<span class="layoff-company">{layoff.company}</span>
							<span class="layoff-count">-{formatCount(layoff.count)}</span>
						</div>
						<div class="layoff-details">
							<span class="layoff-sector {getSectorClass(layoff.sector)}">{layoff.sector}</span>
							<span class="layoff-source">{layoff.source}</span>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.total-layoffs {
		font-size: 0.65rem;
		color: var(--red);
		font-weight: 600;
	}

	.layoffs-list {
		display: flex;
		flex-direction: column;
	}

	.layoff-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.layoff-item:last-child {
		border-bottom: none;
	}

	.layoff-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.layoff-company {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text);
	}

	.layoff-count {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--red);
		font-variant-numeric: tabular-nums;
	}

	.layoff-details {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.layoff-sector {
		font-size: 0.5rem;
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
	}

	.sector-tech {
		background: rgba(68, 136, 255, 0.15);
		color: var(--blue);
	}

	.sector-finance {
		background: rgba(68, 255, 136, 0.15);
		color: var(--green);
	}

	.sector-energy {
		background: rgba(255, 170, 0, 0.15);
		color: var(--yellow);
	}

	.sector-media {
		background: rgba(255, 68, 255, 0.15);
		color: #ff88ff;
	}

	.sector-other {
		background: rgba(136, 136, 136, 0.15);
		color: var(--text-dim);
	}

	.layoff-source {
		font-size: 0.55rem;
		color: var(--text-muted);
	}

	.layoff-link {
		display: block;
		text-decoration: none;
		color: inherit;
		transition: background 0.15s;
	}

	.layoff-link:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.layoff-link:hover .layoff-company {
		color: var(--accent);
	}

	.empty-state {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>

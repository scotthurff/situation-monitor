<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import { fetchPolymarket } from '$lib/api/polymarket';
	import type { Prediction } from '$lib/types';

	let predictions: Prediction[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	const count = $derived(predictions.length);

	function formatVolume(v: number): string {
		if (!v) return '$0';
		if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
		if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
		return '$' + v.toFixed(0);
	}

	function formatProbability(p: number): string {
		return Math.round(p * 100) + '%';
	}

	async function loadPredictions() {
		loading = true;
		error = null;
		try {
			predictions = await fetchPolymarket();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load predictions';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadPredictions();
	});
</script>

<Panel id="polymarket" title="Polymarket" icon="📊" {count} {loading} {error}>
	{#if predictions.length === 0 && !loading && !error}
		<div class="empty-state">No predictions available</div>
	{:else}
		<div class="predictions-list">
			{#each predictions as pred (pred.id)}
				<div class="prediction-item">
					<div class="prediction-info">
						<div class="prediction-question">{pred.question}</div>
						<div class="prediction-meta">
							<span class="prediction-volume">Vol: {formatVolume(pred.volume)}</span>
							<span class="prediction-category">{pred.category}</span>
						</div>
					</div>
					<div class="prediction-odds">
						<span class="prediction-yes">{formatProbability(pred.probability)}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.predictions-list {
		display: flex;
		flex-direction: column;
	}

	.prediction-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.prediction-item:last-child {
		border-bottom: none;
	}

	.prediction-info {
		flex: 1;
		min-width: 0;
	}

	.prediction-question {
		font-size: 0.65rem;
		color: var(--text);
		line-height: 1.3;
		margin-bottom: 0.2rem;
	}

	.prediction-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.prediction-volume {
		font-size: 0.55rem;
		color: var(--text-muted);
	}

	.prediction-category {
		font-size: 0.5rem;
		color: var(--blue);
		background: rgba(68, 136, 255, 0.15);
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		text-transform: uppercase;
	}

	.prediction-odds {
		margin-left: 0.5rem;
	}

	.prediction-yes {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--green);
		font-variant-numeric: tabular-nums;
	}

	.empty-state {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>

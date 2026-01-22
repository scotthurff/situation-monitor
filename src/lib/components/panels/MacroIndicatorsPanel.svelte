<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import { fetchMacroIndicators } from '$lib/api/fred';
	import type { EconomicIndicator } from '$lib/types';

	let indicators = $state<EconomicIndicator[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let selectedCategory = $state<string>('all');

	const categories = ['all', 'rates', 'inflation', 'employment', 'growth', 'money', 'consumer', 'housing'];

	const filteredIndicators = $derived(
		selectedCategory === 'all'
			? indicators
			: indicators.filter((i) => i.category === selectedCategory)
	);

	function formatValue(value: number, unit: string): string {
		if (unit === '%') return value.toFixed(1) + '%';
		if (unit === 'K') return value.toFixed(0) + 'K';
		if (unit === 'M') return value.toFixed(2) + 'M';
		if (unit === 'T') return '$' + value.toFixed(2) + 'T';
		return value.toFixed(1);
	}

	function getChange(current: number, previous: number | undefined): number {
		return current - (previous ?? current);
	}

	function formatChange(change: number, unit: string): string {
		const sign = change >= 0 ? '+' : '';
		if (unit === '%') return sign + change.toFixed(1);
		if (unit === 'K') return sign + change.toFixed(0);
		return sign + change.toFixed(2);
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
	}

	// Category labels
	const categoryLabels: Record<string, string> = {
		rates: 'Rates',
		inflation: 'Inflation',
		employment: 'Jobs',
		growth: 'Growth',
		money: 'Money',
		consumer: 'Consumer',
		housing: 'Housing'
	};

	async function loadIndicators() {
		isLoading = true;
		error = null;
		try {
			indicators = await fetchMacroIndicators();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load indicators';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadIndicators();
	});
</script>

{#snippet header()}
	<div class="flex gap-1 flex-wrap">
		{#each categories as cat}
			<button
				class="category-btn"
				class:active={selectedCategory === cat}
				onclick={() => (selectedCategory = cat)}
			>
				{cat === 'all' ? 'All' : categoryLabels[cat]}
			</button>
		{/each}
	</div>
{/snippet}

<Panel title="Macro Indicators" icon="📊" loading={isLoading} {error} {header}>
	<div class="indicators-grid">
		{#each filteredIndicators as indicator}
			{@const change = getChange(indicator.value, indicator.previousValue)}
			<div class="indicator-item">
				<div class="indicator-header">
					<span class="indicator-name">{indicator.shortName}</span>
					<span class="indicator-date">{formatDate(indicator.lastUpdated)}</span>
				</div>
				<div class="indicator-value">
					{formatValue(indicator.value, indicator.unit)}
				</div>
				<div
					class="indicator-change"
					class:positive={change >= 0}
					class:negative={change < 0}
				>
					{formatChange(change, indicator.unit)}
				</div>
			</div>
		{/each}
	</div>
</Panel>

<style>
	.category-btn {
		font-size: 0.6rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		background: rgba(255, 255, 255, 0.05);
		color: var(--text-muted);
		border: none;
		cursor: pointer;
		transition: all 0.15s;
	}

	.category-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-secondary);
	}

	.category-btn.active {
		background: var(--accent);
		color: var(--bg-primary);
	}

	.indicators-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}

	.indicator-item {
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 0.25rem;
		border: 1px solid var(--border);
	}

	.indicator-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.indicator-name {
		font-size: 0.7rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.indicator-date {
		font-size: 0.55rem;
		color: var(--text-muted);
		opacity: 0.7;
	}

	.indicator-value {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
	}

	.indicator-change {
		font-size: 0.65rem;
		font-family: 'JetBrains Mono', monospace;
	}

	.indicator-change.positive {
		color: #2ed573;
	}

	.indicator-change.negative {
		color: #ff4757;
	}

	@media (min-width: 1200px) {
		.indicators-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>

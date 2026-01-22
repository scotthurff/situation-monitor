<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import { fetchTreasuryYields } from '$lib/api/fred';
	import type { YieldCurvePoint } from '$lib/types';

	let yields = $state<YieldCurvePoint[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Derived values
	const spread10Y2Y = $derived(() => {
		const y10 = yields.find((y) => y.maturity === '10Y');
		const y2 = yields.find((y) => y.maturity === '2Y');
		if (!y10 || !y2) return 0;
		return y10.rate - y2.rate;
	});
	const isInverted = $derived(spread10Y2Y() < 0);

	function formatRate(rate: number): string {
		return rate.toFixed(2) + '%';
	}

	function formatChange(change: number): string {
		const sign = change >= 0 ? '+' : '';
		return sign + change.toFixed(2);
	}

	async function loadYields() {
		isLoading = true;
		error = null;
		try {
			yields = await fetchTreasuryYields();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load yields';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadYields();
	});
</script>

{#snippet header()}
	<div class="text-xs">
		<span class={isInverted ? 'text-danger' : 'text-success'}>
			10Y-2Y: {formatChange(spread10Y2Y())} {isInverted ? '(Inverted)' : ''}
		</span>
	</div>
{/snippet}

<Panel title="Treasury Yields" icon="📈" loading={isLoading} {error} {header}>
	<div class="yield-grid">
		{#each yields as yield_item}
			<div class="yield-item">
				<div class="yield-maturity">{yield_item.maturity}</div>
				<div class="yield-rate">{formatRate(yield_item.rate)}</div>
				<div
					class="yield-change"
					class:positive={yield_item.change >= 0}
					class:negative={yield_item.change < 0}
				>
					{formatChange(yield_item.change)}
				</div>
			</div>
		{/each}
	</div>

	<!-- Mini Yield Curve Visualization -->
	{#if yields.length > 0}
		<div class="yield-curve mt-3 pt-3 border-t border-border">
			<div class="text-xs text-muted mb-2">Yield Curve</div>
			<div class="curve-container">
				{#each yields as yield_item, i}
					<div
						class="curve-bar"
						style="height: {(yield_item.rate / 6) * 100}%"
						title="{yield_item.maturity}: {formatRate(yield_item.rate)}"
					></div>
				{/each}
			</div>
			<div class="curve-labels">
				<span>1M</span>
				<span>2Y</span>
				<span>10Y</span>
				<span>30Y</span>
			</div>
		</div>
	{/if}
</Panel>

<style>
	.yield-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	.yield-item {
		text-align: center;
		padding: 0.375rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 0.25rem;
	}

	.yield-maturity {
		font-size: 0.65rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.yield-rate {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
	}

	.yield-change {
		font-size: 0.65rem;
		font-family: 'JetBrains Mono', monospace;
	}

	.yield-change.positive {
		color: #2ed573;
	}

	.yield-change.negative {
		color: #ff4757;
	}

	.curve-container {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		height: 60px;
		gap: 2px;
	}

	.curve-bar {
		flex: 1;
		background: linear-gradient(to top, var(--accent), var(--accent)/50);
		border-radius: 2px 2px 0 0;
		min-height: 4px;
		transition: height 0.3s ease;
	}

	.curve-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.6rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
	}

	.text-danger {
		color: #ff4757;
	}

	.text-success {
		color: #2ed573;
	}
</style>

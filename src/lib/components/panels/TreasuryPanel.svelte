<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { TREASURY_YIELDS } from '$lib/config/markets';

	interface YieldData {
		maturity: string;
		rate: number;
		change: number;
	}

	// Mock data - will be replaced with real FRED API data
	let yields = $state<YieldData[]>([
		{ maturity: '1M', rate: 5.32, change: -0.02 },
		{ maturity: '3M', rate: 5.28, change: -0.01 },
		{ maturity: '6M', rate: 5.15, change: -0.03 },
		{ maturity: '1Y', rate: 4.89, change: -0.05 },
		{ maturity: '2Y', rate: 4.42, change: -0.08 },
		{ maturity: '5Y', rate: 4.18, change: -0.06 },
		{ maturity: '10Y', rate: 4.28, change: -0.04 },
		{ maturity: '30Y', rate: 4.52, change: -0.02 }
	]);

	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Derived values
	const spread10Y2Y = $derived(
		yields.find((y) => y.maturity === '10Y')!.rate - yields.find((y) => y.maturity === '2Y')!.rate
	);
	const isInverted = $derived(spread10Y2Y < 0);

	function formatRate(rate: number): string {
		return rate.toFixed(2) + '%';
	}

	function formatChange(change: number): string {
		const sign = change >= 0 ? '+' : '';
		return sign + change.toFixed(2);
	}
</script>

{#snippet header()}
	<div class="text-xs">
		<span class={isInverted ? 'text-danger' : 'text-success'}>
			10Y-2Y: {formatChange(spread10Y2Y)} {isInverted ? '(Inverted)' : ''}
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
</style>

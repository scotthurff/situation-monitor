<script lang="ts">
	import { Panel } from '$lib/components/common';

	interface Indicator {
		name: string;
		shortName: string;
		value: number;
		previousValue: number;
		unit: string;
		category: string;
		lastUpdated: string;
	}

	// Mock data - will be replaced with real FRED API data
	let indicators = $state<Indicator[]>([
		// Rates
		{ name: 'Fed Funds Rate', shortName: 'Fed Funds', value: 5.33, previousValue: 5.33, unit: '%', category: 'rates', lastUpdated: 'Dec 2024' },
		{ name: '30-Year Mortgage', shortName: '30Y Mortgage', value: 6.91, previousValue: 6.84, unit: '%', category: 'rates', lastUpdated: 'Jan 2025' },

		// Inflation
		{ name: 'CPI YoY', shortName: 'CPI', value: 2.9, previousValue: 2.7, unit: '%', category: 'inflation', lastUpdated: 'Dec 2024' },
		{ name: 'Core CPI YoY', shortName: 'Core CPI', value: 3.2, previousValue: 3.3, unit: '%', category: 'inflation', lastUpdated: 'Dec 2024' },
		{ name: 'Core PCE YoY', shortName: 'Core PCE', value: 2.8, previousValue: 2.8, unit: '%', category: 'inflation', lastUpdated: 'Nov 2024' },

		// Employment
		{ name: 'Unemployment Rate', shortName: 'Unemployment', value: 4.1, previousValue: 4.2, unit: '%', category: 'employment', lastUpdated: 'Dec 2024' },
		{ name: 'Nonfarm Payrolls', shortName: 'NFP', value: 256, previousValue: 212, unit: 'K', category: 'employment', lastUpdated: 'Dec 2024' },
		{ name: 'Initial Claims', shortName: 'Claims', value: 217, previousValue: 220, unit: 'K', category: 'employment', lastUpdated: 'Jan 2025' },

		// Growth
		{ name: 'Real GDP Growth', shortName: 'GDP', value: 3.1, previousValue: 2.8, unit: '%', category: 'growth', lastUpdated: 'Q3 2024' },
		{ name: 'Industrial Production', shortName: 'IP', value: 0.1, previousValue: -0.4, unit: '%', category: 'growth', lastUpdated: 'Nov 2024' },

		// Money
		{ name: 'M2 YoY', shortName: 'M2', value: 3.9, previousValue: 3.5, unit: '%', category: 'money', lastUpdated: 'Nov 2024' },
		{ name: 'Fed Balance Sheet', shortName: 'Fed BS', value: 6.89, previousValue: 6.92, unit: 'T', category: 'money', lastUpdated: 'Jan 2025' },

		// Consumer
		{ name: 'Retail Sales YoY', shortName: 'Retail', value: 3.6, previousValue: 2.9, unit: '%', category: 'consumer', lastUpdated: 'Dec 2024' },
		{ name: 'Michigan Sentiment', shortName: 'UMich', value: 73.2, previousValue: 74.0, unit: '', category: 'consumer', lastUpdated: 'Jan 2025' },

		// Housing
		{ name: 'Housing Starts', shortName: 'Starts', value: 1.289, previousValue: 1.311, unit: 'M', category: 'housing', lastUpdated: 'Nov 2024' },
		{ name: 'Existing Home Sales', shortName: 'EHS', value: 4.15, previousValue: 3.96, unit: 'M', category: 'housing', lastUpdated: 'Nov 2024' }
	]);

	let isLoading = $state(false);
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

	function getChange(current: number, previous: number): number {
		return current - previous;
	}

	function formatChange(change: number, unit: string): string {
		const sign = change >= 0 ? '+' : '';
		if (unit === '%') return sign + change.toFixed(1);
		if (unit === 'K') return sign + change.toFixed(0);
		return sign + change.toFixed(2);
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
					<span class="indicator-date">{indicator.lastUpdated}</span>
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

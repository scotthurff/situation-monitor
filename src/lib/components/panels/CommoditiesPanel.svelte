<script lang="ts">
	import { Panel, Sparkline } from '$lib/components/common';
	import { marketsStore } from '$lib/stores';

	function formatPrice(price: number): string {
		if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
		if (price >= 100) return price.toFixed(1);
		return price.toFixed(2);
	}
</script>

<Panel
	title="Commodities"
	icon="🛢️"
	loading={marketsStore.isLoading}
	lastUpdated={marketsStore.lastUpdated}
>
	{#if marketsStore.commodities.length === 0}
		<div class="empty-state">
			Loading commodities...
		</div>
	{:else}
		<table class="commodity-table">
			<thead>
				<tr>
					<th class="col-name">Commodity</th>
					<th class="col-price">Price</th>
					<th class="col-chart">Trend</th>
					<th class="col-change">Chg</th>
				</tr>
			</thead>
			<tbody>
				{#each marketsStore.commodities as item (item.symbol)}
					<tr>
						<td class="col-name">
							<span class="commodity-name">{item.name}</span>
						</td>
						<td class="col-price">
							${formatPrice(item.price)}<span class="unit">{item.unit}</span>
						</td>
						<td class="col-chart">
							<Sparkline data={item.sparkline || []} width={50} height={18} />
						</td>
						<td class="col-change" class:positive={item.changePercent >= 0} class:negative={item.changePercent < 0}>
							{item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</Panel>

<style>
	.empty-state {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-align: center;
		padding: 1rem 0;
	}

	.commodity-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.7rem;
	}

	.commodity-table thead tr {
		border-bottom: 1px solid var(--border);
	}

	.commodity-table th {
		font-weight: 500;
		color: var(--text-dim);
		text-align: left;
		padding: 0.25rem 0.25rem;
		font-size: 0.55rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.commodity-table td {
		padding: 0.375rem 0.25rem;
		color: var(--text);
		vertical-align: middle;
	}

	.commodity-table tbody tr {
		border-bottom: 1px solid var(--border);
	}

	.commodity-table tbody tr:last-child {
		border-bottom: none;
	}

	.col-name {
		white-space: nowrap;
	}

	.commodity-name {
		font-weight: 500;
		font-size: 0.65rem;
	}

	.col-price {
		font-family: 'SF Mono', 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		white-space: nowrap;
	}

	.unit {
		font-size: 0.5rem;
		color: var(--text-muted);
		margin-left: 0.1rem;
	}

	.col-chart {
		padding: 0.25rem;
		width: 50px;
	}

	.col-change {
		font-family: 'SF Mono', 'JetBrains Mono', monospace;
		font-size: 0.6rem;
		text-align: right;
	}

	.col-change.positive {
		color: var(--green);
	}

	.col-change.negative {
		color: var(--red);
	}

	/* Header alignment */
	.commodity-table th.col-change {
		text-align: right;
	}
</style>

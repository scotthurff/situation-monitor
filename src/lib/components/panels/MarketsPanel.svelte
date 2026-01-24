<script lang="ts">
	import { Panel, Sparkline, MarketItem } from '$lib/components/common';
	import { marketsStore } from '$lib/stores';

	// Index short names for compact display
	const INDEX_NAMES: Record<string, string> = {
		'^GSPC': 'S&P 500',
		'^DJI': 'Dow',
		'^IXIC': 'Nasdaq',
		'^RUT': 'Russell',
		'^VIX': 'VIX'
	};

	function getIndexName(symbol: string, name: string): string {
		return INDEX_NAMES[symbol] || name;
	}

	function formatPrice(price: number): string {
		if (price >= 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
		if (price >= 100) return price.toFixed(1);
		return price.toFixed(2);
	}
</script>

<Panel
	title="Markets"
	icon="📈"
	loading={marketsStore.isLoading}
	error={marketsStore.error}
	lastUpdated={marketsStore.lastUpdated}
>
	{#if marketsStore.indices.length === 0}
		<div class="empty-state">
			{marketsStore.isLoading ? 'Loading markets...' : 'No market data available'}
		</div>
	{:else}
		<div class="markets-content">
			<!-- Indices with sparklines -->
			<table class="indices-table">
				<thead>
					<tr>
						<th class="col-name">Index</th>
						<th class="col-price">Price</th>
						<th class="col-chart">Trend</th>
						<th class="col-change">Chg</th>
					</tr>
				</thead>
				<tbody>
					{#each marketsStore.indices as item (item.symbol)}
						<tr>
							<td class="col-name">
								<span class="index-name">{getIndexName(item.symbol, item.name)}</span>
							</td>
							<td class="col-price">{formatPrice(item.price)}</td>
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

			{#if marketsStore.stocks.length > 0}
				<div class="stocks-section">
					<div class="section-label">Stocks</div>
					{#each marketsStore.stocks.slice(0, 6) as item (item.symbol)}
						<MarketItem {item} type="stock" />
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</Panel>

<style>
	.empty-state {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-align: center;
		padding: 1rem 0;
	}

	.markets-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.indices-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.7rem;
	}

	.indices-table thead tr {
		border-bottom: 1px solid var(--border);
	}

	.indices-table th {
		font-weight: 500;
		color: var(--text-dim);
		text-align: left;
		padding: 0.25rem 0.25rem;
		font-size: 0.55rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.indices-table td {
		padding: 0.375rem 0.25rem;
		color: var(--text);
		vertical-align: middle;
	}

	.indices-table tbody tr {
		border-bottom: 1px solid var(--border);
	}

	.indices-table tbody tr:last-child {
		border-bottom: none;
	}

	.col-name {
		white-space: nowrap;
	}

	.index-name {
		font-weight: 500;
		font-size: 0.65rem;
	}

	.col-price {
		font-family: 'SF Mono', 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		white-space: nowrap;
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
	.indices-table th.col-change {
		text-align: right;
	}

	.stocks-section {
		border-top: 1px solid var(--border);
		padding-top: 0.5rem;
	}

	.section-label {
		font-size: 0.55rem;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}
</style>

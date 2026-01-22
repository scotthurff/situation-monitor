<script lang="ts">
	import { Panel, Sparkline } from '$lib/components/common';
	import { marketsStore } from '$lib/stores';
	import { formatCryptoPrice, formatCryptoMarketCap } from '$lib/api/crypto';

	// Crypto icons mapping
	const CRYPTO_ICONS: Record<string, string> = {
		BTC: '₿',
		ETH: 'Ξ',
		SOL: '◎',
		XRP: '✕',
		ADA: '₳',
		DOGE: 'Ð',
		DOT: '●',
		AVAX: '▲'
	};

	function getCryptoIcon(symbol: string): string {
		return CRYPTO_ICONS[symbol] || '◆';
	}
</script>

<Panel
	title="Crypto"
	icon="₿"
	loading={marketsStore.isLoading}
	lastUpdated={marketsStore.lastUpdated}
>
	{#if marketsStore.crypto.length === 0}
		<div class="empty-state">
			Loading crypto...
		</div>
	{:else}
		<table class="crypto-table">
			<thead>
				<tr>
					<th class="col-asset">Asset</th>
					<th class="col-price">Price</th>
					<th class="col-chart">7D</th>
					<th class="col-change">24h</th>
					<th class="col-cap">Mkt Cap</th>
				</tr>
			</thead>
			<tbody>
				{#each marketsStore.crypto as item (item.id)}
					<tr>
						<td class="col-asset">
							<span class="crypto-icon">{getCryptoIcon(item.symbol)}</span>
							<span class="crypto-symbol">{item.symbol}</span>
						</td>
						<td class="col-price">{formatCryptoPrice(item.price)}</td>
						<td class="col-chart">
							<Sparkline data={item.sparkline || []} width={60} height={20} />
						</td>
						<td class="col-change" class:positive={item.change24h >= 0} class:negative={item.change24h < 0}>
							{item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(1)}%
						</td>
						<td class="col-cap">{formatCryptoMarketCap(item.marketCap)}</td>
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

	.crypto-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.7rem;
	}

	.crypto-table thead tr {
		border-bottom: 1px solid var(--border);
	}

	.crypto-table th {
		font-weight: 500;
		color: var(--text-dim);
		text-align: left;
		padding: 0.25rem 0.375rem;
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.crypto-table td {
		padding: 0.375rem 0.375rem;
		color: var(--text);
		vertical-align: middle;
	}

	.crypto-table tbody tr {
		border-bottom: 1px solid var(--border);
	}

	.crypto-table tbody tr:last-child {
		border-bottom: none;
	}

	.col-asset {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.crypto-icon {
		font-size: 0.85rem;
		width: 1rem;
		text-align: center;
	}

	.crypto-symbol {
		font-weight: 500;
	}

	.col-price {
		font-family: 'SF Mono', monospace;
		font-size: 0.65rem;
	}

	.col-chart {
		padding: 0.25rem;
	}

	.col-change {
		font-family: 'SF Mono', monospace;
		font-size: 0.65rem;
		text-align: right;
	}

	.col-change.positive {
		color: var(--green);
	}

	.col-change.negative {
		color: var(--red);
	}

	.col-cap {
		font-family: 'SF Mono', monospace;
		font-size: 0.6rem;
		color: var(--text-muted);
		text-align: right;
	}

	/* Header alignment */
	.crypto-table th.col-change,
	.crypto-table th.col-cap {
		text-align: right;
	}
</style>

<script lang="ts">
	import { formatPrice, formatChange } from '$lib/config';
	import type { MarketData, CryptoData, CommodityData } from '$lib/types';

	interface Props {
		item: MarketData | CryptoData | CommodityData;
		type?: 'index' | 'stock' | 'crypto' | 'commodity' | 'forex';
	}

	let { item, type = 'stock' }: Props = $props();

	// All types have symbol, name, and price - use type assertion for union access
	function getChange(i: MarketData | CryptoData | CommodityData): number {
		if ('change24h' in i) return (i as CryptoData).change24h;
		return (i as MarketData | CommodityData).changePercent;
	}

	const change = $derived(getChange(item));
	const isPositive = $derived(change >= 0);
</script>

<div class="market-item">
	<div class="flex justify-between items-start">
		<div class="min-w-0 flex-1">
			<div class="market-symbol">
				{item.symbol}
			</div>
			<div class="market-name truncate">
				{item.name}
			</div>
		</div>
		<div class="text-right">
			<div class="market-price">
				{type === 'crypto' && item.price < 1 ? `$${item.price.toFixed(4)}` : `$${formatPrice(item.price, type)}`}
			</div>
			<div class="market-change" class:positive={isPositive} class:negative={!isPositive}>
				{formatChange(change)}
			</div>
		</div>
	</div>
</div>

<style>
	.market-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.market-item:last-child {
		border-bottom: none;
	}

	.market-symbol {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.market-name {
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.market-price {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
	}

	.market-change {
		font-size: 0.75rem;
		font-family: 'JetBrains Mono', monospace;
	}

	.market-change.positive {
		color: #2ed573;
	}

	.market-change.negative {
		color: #ff4757;
	}
</style>

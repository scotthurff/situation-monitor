<script lang="ts">
	import { Panel, MarketItem } from '$lib/components/common';
	import { marketsStore } from '$lib/stores';
</script>

<Panel
	title="Markets"
	icon="📈"
	loading={marketsStore.isLoading}
	error={marketsStore.error}
>
	{#if marketsStore.indices.length === 0}
		<div class="text-sm text-muted text-center py-4">
			{marketsStore.isLoading ? 'Loading markets...' : 'No market data available'}
		</div>
	{:else}
		<div class="space-y-0">
			<div class="text-xs text-muted uppercase tracking-wider mb-2">Indices</div>
			{#each marketsStore.indices as item (item.symbol)}
				<MarketItem {item} type="index" />
			{/each}

			{#if marketsStore.stocks.length > 0}
				<div class="text-xs text-muted uppercase tracking-wider mt-4 mb-2">Stocks</div>
				{#each marketsStore.stocks.slice(0, 8) as item (item.symbol)}
					<MarketItem {item} type="stock" />
				{/each}
			{/if}
		</div>
	{/if}
</Panel>

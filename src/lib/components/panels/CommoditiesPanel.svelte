<script lang="ts">
	import { Panel, MarketItem } from '$lib/components/common';
	import { marketsStore } from '$lib/stores';
</script>

<Panel
	title="Commodities"
	icon="🛢️"
	loading={marketsStore.isLoading}
>
	{#if marketsStore.commodities.length === 0}
		<div class="text-sm text-muted text-center py-4">
			Loading commodities...
		</div>
	{:else}
		<div class="space-y-0">
			{#each marketsStore.commodities as item (item.symbol)}
				<MarketItem {item} type="commodity" />
			{/each}
		</div>
	{/if}
</Panel>

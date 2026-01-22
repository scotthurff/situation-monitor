<script lang="ts">
	import { Panel, MarketItem } from '$lib/components/common';
	import { marketsStore } from '$lib/stores';
</script>

<Panel
	title="Crypto"
	icon="₿"
	loading={marketsStore.isLoading}
>
	{#if marketsStore.crypto.length === 0}
		<div class="text-sm text-muted text-center py-4">
			Loading crypto...
		</div>
	{:else}
		<div class="space-y-0">
			{#each marketsStore.crypto as item (item.id)}
				<MarketItem {item} type="crypto" />
			{/each}
		</div>
	{/if}
</Panel>

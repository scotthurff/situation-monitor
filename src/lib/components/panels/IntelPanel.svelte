<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';
</script>

<Panel
	title="Intel"
	icon="🔍"
	loading={newsStore.isLoading}
>
	{#if newsStore.intelNews.length === 0}
		<div class="text-sm text-muted text-center py-4">
			Loading intel sources...
		</div>
	{:else}
		<div class="space-y-0">
			{#each newsStore.intelNews.slice(0, 20) as item (item.id)}
				<NewsItem {item} />
			{/each}
		</div>
	{/if}
</Panel>

<script lang="ts">
	import { MobileView } from '$lib/components/layout';
	import { NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';

	const items = $derived(newsStore.news.slice(0, 50));
</script>

<MobileView>
	{#if items.length === 0}
		<div class="empty-state">
			{newsStore.isLoading ? 'Loading news...' : 'No news available'}
		</div>
	{:else}
		<div class="news-list">
			{#each items as item (item.id)}
				<NewsItem {item} />
			{/each}
		</div>
	{/if}
</MobileView>

<style>
	.empty-state {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.85rem;
		padding: 2rem 1rem;
	}

	.news-list {
		display: flex;
		flex-direction: column;
	}
</style>

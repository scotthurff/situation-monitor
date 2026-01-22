<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';
	import type { NewsCategory } from '$lib/types';

	interface Props {
		category?: NewsCategory | 'all';
		limit?: number;
	}

	let { category = 'all', limit = 50 }: Props = $props();

	const items = $derived(
		category === 'all'
			? newsStore.news.slice(0, limit)
			: newsStore.getByCategory(category as NewsCategory).slice(0, limit)
	);
</script>

<Panel
	title={category === 'all' ? 'News Feed' : `${category.toUpperCase()} News`}
	icon="📰"
	loading={newsStore.isLoading}
	error={newsStore.error}
>
	{#if items.length === 0}
		<div class="text-sm text-muted text-center py-4">
			{newsStore.isLoading ? 'Loading news...' : 'No news available'}
		</div>
	{:else}
		<div class="space-y-0">
			{#each items as item (item.id)}
				<NewsItem {item} />
			{/each}
		</div>
	{/if}
</Panel>

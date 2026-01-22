<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';
	import type { NewsItem as NewsItemType } from '$lib/types';

	interface Props {
		id: string;
		title: string;
		description: string;
		keywords: string[];
		icon?: string;
		limit?: number;
	}

	let { id, title, description, keywords, icon = '📍', limit = 15 }: Props = $props();

	/**
	 * Filter news items that match any of the keywords
	 */
	function matchesKeywords(item: NewsItemType): boolean {
		const text = `${item.title} ${item.description || ''}`.toLowerCase();
		return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
	}

	const matchingItems = $derived(
		newsStore.news.filter(matchesKeywords).slice(0, limit)
	);
</script>

<Panel
	id="situation-{id}"
	{title}
	{icon}
	count={matchingItems.length}
	loading={newsStore.isLoading}
>
	{#snippet header()}
		<div class="situation-description">
			{description}
		</div>
		<div class="situation-keywords">
			{#each keywords.slice(0, 5) as keyword}
				<span class="keyword-tag">{keyword}</span>
			{/each}
			{#if keywords.length > 5}
				<span class="keyword-more">+{keywords.length - 5}</span>
			{/if}
		</div>
	{/snippet}

	{#if matchingItems.length === 0}
		<div class="empty-state">
			{newsStore.isLoading ? 'Scanning news feeds...' : 'No recent news matching this situation'}
		</div>
	{:else}
		<div class="news-list">
			{#each matchingItems as item (item.id)}
				<NewsItem {item} />
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.situation-description {
		font-size: 0.65rem;
		color: var(--text-muted);
		margin-bottom: 0.5rem;
	}

	.situation-keywords {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.keyword-tag {
		font-size: 0.55rem;
		padding: 0.125rem 0.375rem;
		background: rgba(100, 200, 255, 0.15);
		color: var(--accent);
		border-radius: 0.25rem;
		border: 1px solid var(--accent);
		opacity: 0.8;
	}

	.keyword-more {
		font-size: 0.55rem;
		color: var(--text-muted);
		padding: 0.125rem 0.25rem;
	}

	.empty-state {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.7rem;
		padding: 1rem;
	}

	.news-list {
		display: flex;
		flex-direction: column;
	}
</style>

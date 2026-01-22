<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';
	import type { NewsItem as NewsItemType } from '$lib/types';

	interface Props {
		limit?: number;
	}

	let { limit = 25 }: Props = $props();

	// AI-related keywords for additional filtering
	const AI_KEYWORDS = [
		'artificial intelligence',
		'machine learning',
		'deep learning',
		'neural network',
		'llm',
		'chatgpt',
		'openai',
		'anthropic',
		'claude',
		'gemini',
		'gpt',
		'transformer',
		'diffusion',
		'generative ai',
		'ai model',
		'ai safety',
		'agi'
	];

	// Topic tags for categorization
	type AITopic = 'research' | 'product' | 'policy' | 'funding' | 'general';

	function classifyTopic(item: NewsItemType): AITopic {
		const text = `${item.title} ${item.description || ''}`.toLowerCase();

		if (
			text.includes('paper') ||
			text.includes('research') ||
			text.includes('study') ||
			text.includes('arxiv') ||
			text.includes('benchmark')
		) {
			return 'research';
		}
		if (
			text.includes('launch') ||
			text.includes('release') ||
			text.includes('announce') ||
			text.includes('product') ||
			text.includes('feature') ||
			text.includes('update')
		) {
			return 'product';
		}
		if (
			text.includes('regulation') ||
			text.includes('policy') ||
			text.includes('law') ||
			text.includes('government') ||
			text.includes('safety') ||
			text.includes('ethics')
		) {
			return 'policy';
		}
		if (
			text.includes('funding') ||
			text.includes('investment') ||
			text.includes('valuation') ||
			text.includes('raise') ||
			text.includes('billion') ||
			text.includes('million')
		) {
			return 'funding';
		}
		return 'general';
	}

	function getTopicStyle(topic: AITopic): string {
		switch (topic) {
			case 'research':
				return 'topic-research';
			case 'product':
				return 'topic-product';
			case 'policy':
				return 'topic-policy';
			case 'funding':
				return 'topic-funding';
			default:
				return 'topic-general';
		}
	}

	/**
	 * Get AI news items - first from category, then supplement with keyword matches
	 */
	const aiNews = $derived(() => {
		// Get items from AI category
		const categoryItems = newsStore.getByCategory('ai');

		// Also get items that mention AI keywords in other categories
		const keywordItems = newsStore.news.filter((item) => {
			if (item.category === 'ai') return false; // Already included
			const text = `${item.title} ${item.description || ''}`.toLowerCase();
			return AI_KEYWORDS.some((kw) => text.includes(kw));
		});

		// Combine and sort by date
		const combined = [...categoryItems, ...keywordItems];
		combined.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

		return combined.slice(0, limit);
	});

	// Count by severity
	const highSeverityCount = $derived(
		aiNews().filter((item) => item.severity === 'high' || item.severity === 'critical').length
	);
</script>

<Panel
	id="ai-news"
	title="AI / Technology"
	icon="🤖"
	count={aiNews().length}
	loading={newsStore.isLoading}
>
	{#snippet header()}
		<div class="ai-stats">
			{#if highSeverityCount > 0}
				<span class="severity-badge high">
					{highSeverityCount} high priority
				</span>
			{/if}
		</div>
	{/snippet}

	{#if aiNews().length === 0}
		<div class="empty-state">
			{newsStore.isLoading ? 'Loading AI news...' : 'No AI news available'}
		</div>
	{:else}
		<div class="news-list">
			{#each aiNews() as item (item.id)}
				{@const topic = classifyTopic(item)}
				<div class="ai-news-item">
					<span class="topic-tag {getTopicStyle(topic)}">{topic}</span>
					<NewsItem {item} />
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.ai-stats {
		display: flex;
		gap: 0.5rem;
	}

	.severity-badge {
		font-size: 0.55rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-weight: 500;
	}

	.severity-badge.high {
		background: rgba(255, 100, 100, 0.2);
		color: var(--red);
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

	.ai-news-item {
		position: relative;
	}

	.topic-tag {
		position: absolute;
		top: 0.5rem;
		right: 0;
		font-size: 0.5rem;
		padding: 0.1rem 0.25rem;
		border-radius: 0.15rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		font-weight: 500;
	}

	.topic-research {
		background: rgba(100, 150, 255, 0.2);
		color: rgb(100, 150, 255);
	}

	.topic-product {
		background: rgba(100, 255, 150, 0.2);
		color: rgb(100, 255, 150);
	}

	.topic-policy {
		background: rgba(255, 200, 100, 0.2);
		color: rgb(255, 200, 100);
	}

	.topic-funding {
		background: rgba(255, 100, 255, 0.2);
		color: rgb(255, 100, 255);
	}

	.topic-general {
		background: rgba(150, 150, 150, 0.2);
		color: rgb(150, 150, 150);
	}
</style>

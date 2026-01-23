<script lang="ts">
	import { MobileView } from '$lib/components/layout';
	import { NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';
	import { mobileNavStore } from '$lib/stores/mobileNav.svelte';
	import type { NewsItem as NewsItemType } from '$lib/types';

	// AI-related keywords
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

	// AI News items
	const aiNews = $derived(() => {
		const categoryItems = newsStore.getByCategory('ai');
		const keywordItems = newsStore.news.filter((item) => {
			if (item.category === 'ai') return false;
			const text = `${item.title} ${item.description || ''}`.toLowerCase();
			return AI_KEYWORDS.some((kw) => text.includes(kw));
		});
		const combined = [...categoryItems, ...keywordItems];
		combined.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
		return combined.slice(0, 30);
	});

	// Intel News items
	const intelNews = $derived(newsStore.intelNews.slice(0, 30));

	// Topic classification
	type AITopic = 'research' | 'product' | 'policy' | 'funding' | 'general';

	function classifyTopic(item: NewsItemType): AITopic {
		const text = `${item.title} ${item.description || ''}`.toLowerCase();
		if (text.includes('paper') || text.includes('research') || text.includes('arxiv')) {
			return 'research';
		}
		if (text.includes('launch') || text.includes('release') || text.includes('product')) {
			return 'product';
		}
		if (text.includes('regulation') || text.includes('policy') || text.includes('safety')) {
			return 'policy';
		}
		if (text.includes('funding') || text.includes('investment') || text.includes('billion')) {
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

	function handleTabClick(tab: 'ai' | 'intel') {
		mobileNavStore.setIntelSubTab(tab);
	}
</script>

<MobileView>
	<!-- Segmented Control -->
	<div class="segmented-control">
		<button
			class="segment"
			class:active={mobileNavStore.intelSubTab === 'ai'}
			onclick={() => handleTabClick('ai')}
		>
			<span class="segment-icon">🤖</span>
			<span class="segment-label">AI News</span>
			<span class="segment-count">{aiNews().length}</span>
		</button>
		<button
			class="segment"
			class:active={mobileNavStore.intelSubTab === 'intel'}
			onclick={() => handleTabClick('intel')}
		>
			<span class="segment-icon">🔍</span>
			<span class="segment-label">Intel</span>
			<span class="segment-count">{intelNews.length}</span>
		</button>
	</div>

	<!-- Content -->
	<div class="intel-content">
		{#if mobileNavStore.intelSubTab === 'ai'}
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
		{:else}
			{#if intelNews.length === 0}
				<div class="empty-state">
					{newsStore.isLoading ? 'Loading intel...' : 'No intel available'}
				</div>
			{:else}
				<div class="news-list">
					{#each intelNews as item (item.id)}
						<NewsItem {item} />
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</MobileView>

<style>
	.segmented-control {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		background: var(--surface);
		border-radius: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.segment {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0.625rem 0.5rem;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 0.375rem;
		color: var(--text-muted);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.segment:active {
		background: var(--surface-hover);
	}

	.segment.active {
		background: var(--bg);
		border-color: var(--border);
		color: var(--text);
	}

	.segment-icon {
		font-size: 1rem;
	}

	.segment-label {
		font-weight: 500;
	}

	.segment-count {
		font-size: 0.65rem;
		padding: 0.1rem 0.35rem;
		background: var(--border);
		border-radius: 0.25rem;
		color: var(--text-muted);
	}

	.segment.active .segment-count {
		background: var(--accent);
		color: var(--bg);
	}

	.intel-content {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

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

	.ai-news-item {
		position: relative;
	}

	.topic-tag {
		position: absolute;
		top: 0.5rem;
		right: 0;
		font-size: 0.55rem;
		padding: 0.125rem 0.3rem;
		border-radius: 0.2rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		font-weight: 500;
		z-index: 1;
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

<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';

	interface Props {
		limit?: number;
	}

	let { limit = 25 }: Props = $props();

	// Get US politics specific news
	const items = $derived(newsStore.getByCategory('uspolitics').slice(0, limit));

	// Bias indicator colors
	const biasColors: Record<string, string> = {
		left: 'text-blue-400',
		'center-left': 'text-blue-300',
		center: 'text-gray-400',
		'center-right': 'text-red-300',
		right: 'text-red-400'
	};
</script>

{#snippet header()}
	<div class="flex items-center gap-2 text-xs text-muted">
		<span class="text-blue-400">●</span> Left
		<span class="text-gray-400">●</span> Center
		<span class="text-red-400">●</span> Right
	</div>
{/snippet}

<Panel
	title="US Politics"
	icon="🏛️"
	loading={newsStore.isLoading}
	error={newsStore.error}
	{header}
>
	{#if items.length === 0}
		<div class="text-sm text-muted text-center py-4">
			{newsStore.isLoading ? 'Loading political news...' : 'No political news available'}
		</div>
	{:else}
		<div class="space-y-0">
			{#each items as item (item.id)}
				<NewsItem {item} />
			{/each}
		</div>
	{/if}
</Panel>

<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';

	interface Props {
		limit?: number;
	}

	let { limit = 20 }: Props = $props();

	// Get legal news
	const items = $derived(newsStore.getByCategory('legal').slice(0, limit));

	// Court level badges
	const courtBadges: Record<string, { label: string; class: string }> = {
		supreme: { label: 'SCOTUS', class: 'bg-purple-500/20 text-purple-400' },
		appellate: { label: 'CIRCUIT', class: 'bg-blue-500/20 text-blue-400' },
		district: { label: 'DISTRICT', class: 'bg-gray-500/20 text-gray-400' }
	};
</script>

{#snippet header()}
	<div class="text-xs text-muted">
		Supreme Court, Federal Courts & Legal Developments
	</div>
{/snippet}

<Panel
	title="Court Watch"
	icon="⚖️"
	loading={newsStore.isLoading}
	error={newsStore.error}
	{header}
>
	{#if items.length === 0}
		<div class="text-sm text-muted text-center py-4">
			{newsStore.isLoading ? 'Loading legal news...' : 'No legal news available'}
		</div>
	{:else}
		<div class="space-y-0">
			{#each items as item (item.id)}
				<NewsItem {item} />
			{/each}
		</div>
	{/if}
</Panel>

<style>
	:global(.court-badge) {
		font-size: 0.6rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>

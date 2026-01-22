<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';

	interface Props {
		limit?: number;
	}

	let { limit = 20 }: Props = $props();

	// Get congressional/gov news
	const items = $derived([
		...newsStore.getByCategory('uspolitics'),
		...newsStore.getByCategory('gov')
	]
		.filter((item) => {
			const lowerTitle = item.title.toLowerCase();
			const lowerSource = item.source.toLowerCase();
			return (
				lowerTitle.includes('congress') ||
				lowerTitle.includes('senate') ||
				lowerTitle.includes('house') ||
				lowerTitle.includes('bill') ||
				lowerTitle.includes('vote') ||
				lowerTitle.includes('legislation') ||
				lowerSource.includes('congress') ||
				lowerSource.includes('govtrack')
			);
		})
		.slice(0, limit));

	// Chamber badges
	const chamberBadges: Record<string, { label: string; class: string }> = {
		senate: { label: 'SENATE', class: 'bg-blue-600/20 text-blue-400' },
		house: { label: 'HOUSE', class: 'bg-red-600/20 text-red-400' },
		joint: { label: 'JOINT', class: 'bg-purple-600/20 text-purple-400' }
	};
</script>

{#snippet header()}
	<div class="text-xs text-muted">
		Bills, Votes & Legislative Activity
	</div>
{/snippet}

<Panel
	title="Congress"
	icon="🏛️"
	loading={newsStore.isLoading}
	error={newsStore.error}
	{header}
>
	{#if items.length === 0}
		<div class="text-sm text-muted text-center py-4">
			{newsStore.isLoading ? 'Loading congressional news...' : 'No congressional news available'}
		</div>
	{:else}
		<div class="space-y-0">
			{#each items as item (item.id)}
				<NewsItem {item} />
			{/each}
		</div>
	{/if}
</Panel>

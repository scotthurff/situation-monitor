<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';

	interface Props {
		limit?: number;
	}

	let { limit = 20 }: Props = $props();

	// Get immigration news
	const items = $derived(newsStore.getByCategory('immigration').slice(0, limit));

	// Agency badges
	const agencyBadges: Record<string, { label: string; class: string }> = {
		ice: { label: 'ICE', class: 'bg-blue-600/20 text-blue-400' },
		cbp: { label: 'CBP', class: 'bg-green-600/20 text-green-400' },
		uscis: { label: 'USCIS', class: 'bg-purple-600/20 text-purple-400' },
		dhs: { label: 'DHS', class: 'bg-red-600/20 text-red-400' }
	};
</script>

{#snippet header()}
	<div class="text-xs text-muted">
		ICE, CBP, Border & Immigration Policy
	</div>
{/snippet}

<Panel
	title="Immigration & Enforcement"
	icon="🚨"
	loading={newsStore.isLoading}
	error={newsStore.error}
	{header}
>
	{#if items.length === 0}
		<div class="text-sm text-muted text-center py-4">
			{newsStore.isLoading ? 'Loading immigration news...' : 'No immigration news available'}
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
	:global(.agency-badge) {
		font-size: 0.6rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>

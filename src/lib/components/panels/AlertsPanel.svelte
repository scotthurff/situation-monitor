<script lang="ts">
	import { Panel, NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';

	const alerts = $derived(newsStore.alertNews);
</script>

<Panel
	title="Alerts"
	icon="🚨"
	loading={newsStore.isLoading}
>
	{#if alerts.length === 0}
		<div class="text-sm text-muted text-center py-4">
			No active alerts
		</div>
	{:else}
		<div class="space-y-0">
			{#each alerts.slice(0, 10) as item (item.id)}
				<NewsItem {item} />
			{/each}
		</div>
	{/if}
</Panel>

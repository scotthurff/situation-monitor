<script lang="ts">
	import { refreshStore, settingsStore } from '$lib/stores';
	import { formatRelativeTime } from '$lib/utils';

	function handleRefresh() {
		refreshStore.refresh();
	}
</script>

<header class="header">
	<div class="flex items-center gap-3">
		<h1 class="text-lg font-bold text-accent tracking-tight">
			SITUATION MONITOR
		</h1>
		<span class="text-xs text-muted px-2 py-0.5 bg-accent/10 rounded">LIVE</span>
	</div>

	<div class="flex items-center gap-4">
		{#if refreshStore.lastRefresh}
			<span class="text-xs text-muted">
				Updated {formatRelativeTime(refreshStore.lastRefresh)}
			</span>
		{/if}

		<button
			onclick={handleRefresh}
			disabled={refreshStore.isRefreshing}
			class="refresh-btn"
			class:refreshing={refreshStore.isRefreshing}
		>
			<span class="refresh-icon">↻</span>
			{refreshStore.isRefreshing ? 'Refreshing...' : 'Refresh'}
		</button>

		{#if refreshStore.currentStage}
			<span class="text-xs text-accent">
				Stage: {refreshStore.currentStage}
			</span>
		{/if}
	</div>
</header>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1.5rem;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.refresh-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.refresh-btn:hover:not(:disabled) {
		color: var(--accent);
		border-color: var(--accent);
	}

	.refresh-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.refresh-btn.refreshing .refresh-icon {
		animation: spin 1s linear infinite;
	}

	.refresh-icon {
		font-size: 0.875rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>

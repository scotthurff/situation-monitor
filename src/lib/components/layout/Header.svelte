<script lang="ts">
	import { refreshStore } from '$lib/stores';
	import { RefreshControls } from '$lib/components/common';

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	function handleRefresh() {
		refreshStore.refresh();
	}
</script>

<header class="header">
	<div class="header-left">
		<h1 class="logo">SITUATION MONITOR</h1>
	</div>

	<div class="header-center">
		{#if refreshStore.lastRefresh}
			<span class="update-time">
				Last updated: {formatTime(refreshStore.lastRefresh)}
			</span>
		{/if}
	</div>

	<div class="header-right">
		<RefreshControls />
		<button
			onclick={handleRefresh}
			disabled={refreshStore.isRefreshing}
			class="refresh-btn"
			title="Refresh now"
		>
			{refreshStore.isRefreshing ? '↻' : '↻'}
		</button>
	</div>
</header>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.6rem 1rem;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.header-left,
	.header-right {
		flex: 1;
	}

	.header-center {
		flex: 1;
		text-align: center;
	}

	.header-right {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.75rem;
	}

	.logo {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text);
		letter-spacing: 0.05em;
		margin: 0;
	}

	.update-time {
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.refresh-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		font-size: 0.85rem;
		color: var(--text-dim);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.refresh-btn:hover:not(:disabled) {
		color: var(--text);
		border-color: var(--border-light);
	}

	.refresh-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>

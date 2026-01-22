<script lang="ts">
	import { refreshStore, settingsStore } from '$lib/stores';

	const INTERVALS = [
		{ label: '30s', value: 30000 },
		{ label: '1m', value: 60000 },
		{ label: '5m', value: 300000 }
	];

	function handleIntervalChange(ms: number) {
		refreshStore.setRefreshInterval(ms);
		// If paused, start auto-refresh when selecting an interval
		if (!settingsStore.autoRefreshEnabled) {
			settingsStore.update('autoRefreshEnabled', true);
			refreshStore.startAutoRefresh();
		}
	}

	function togglePause() {
		const newState = !settingsStore.autoRefreshEnabled;
		settingsStore.update('autoRefreshEnabled', newState);
		if (newState) {
			refreshStore.startAutoRefresh();
		} else {
			refreshStore.stopAutoRefresh();
		}
	}
</script>

<div class="refresh-controls">
	<span class="label">Refresh:</span>
	<div class="interval-buttons">
		{#each INTERVALS as interval}
			<button
				class="interval-btn"
				class:active={settingsStore.refreshInterval === interval.value && settingsStore.autoRefreshEnabled}
				onclick={() => handleIntervalChange(interval.value)}
				disabled={refreshStore.isRefreshing}
			>
				{interval.label}
			</button>
		{/each}
		<button
			class="pause-btn"
			class:paused={!settingsStore.autoRefreshEnabled}
			onclick={togglePause}
			disabled={refreshStore.isRefreshing}
			title={settingsStore.autoRefreshEnabled ? 'Pause auto-refresh' : 'Resume auto-refresh'}
		>
			{settingsStore.autoRefreshEnabled ? '⏸' : '▶'}
		</button>
	</div>
</div>

<style>
	.refresh-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.label {
		font-size: 0.65rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.interval-buttons {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.interval-btn,
	.pause-btn {
		padding: 0.25rem 0.5rem;
		font-size: 0.6rem;
		color: var(--text-dim);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 3px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.interval-btn:hover:not(:disabled),
	.pause-btn:hover:not(:disabled) {
		color: var(--text);
		border-color: var(--border-light);
	}

	.interval-btn.active {
		color: var(--accent);
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.1);
	}

	.pause-btn {
		font-size: 0.7rem;
		padding: 0.2rem 0.4rem;
	}

	.pause-btn.paused {
		color: var(--green);
		border-color: var(--green);
	}

	.interval-btn:disabled,
	.pause-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

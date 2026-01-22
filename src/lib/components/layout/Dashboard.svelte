<script lang="ts">
	import { onMount } from 'svelte';
	import { refreshStore, settingsStore } from '$lib/stores';
	import { Header } from '$lib/components/layout';
	import {
		NewsPanel,
		MarketsPanel,
		CryptoPanel,
		CommoditiesPanel,
		AlertsPanel,
		IntelPanel
	} from '$lib/components/panels';

	onMount(() => {
		// Start auto-refresh
		refreshStore.startAutoRefresh();

		return () => {
			refreshStore.stopAutoRefresh();
		};
	});
</script>

<div class="dashboard">
	<Header />

	<main class="dashboard-main">
		<!-- Left Column: News -->
		<div class="dashboard-col col-news">
			<NewsPanel limit={50} />
		</div>

		<!-- Center Column: Markets -->
		<div class="dashboard-col col-markets">
			<div class="panel-stack">
				<MarketsPanel />
				<CryptoPanel />
				<CommoditiesPanel />
			</div>
		</div>

		<!-- Right Column: Alerts & Intel -->
		<div class="dashboard-col col-intel">
			<div class="panel-stack">
				<AlertsPanel />
				<IntelPanel />
			</div>
		</div>
	</main>

	<!-- Error Toast -->
	{#if refreshStore.errors.length > 0}
		<div class="error-toast">
			<div class="text-sm font-medium text-danger mb-1">Errors</div>
			{#each refreshStore.errors as error}
				<div class="text-xs text-muted">{error}</div>
			{/each}
			<button
				onclick={() => refreshStore.clearErrors()}
				class="text-xs text-accent mt-2 hover:underline"
			>
				Dismiss
			</button>
		</div>
	{/if}
</div>

<style>
	.dashboard {
		min-height: 100vh;
		background: var(--bg-primary);
	}

	.dashboard-main {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
		max-width: 1800px;
		margin: 0 auto;
	}

	.dashboard-col {
		display: flex;
		flex-direction: column;
		min-height: calc(100vh - 80px);
	}

	.panel-stack {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;
	}

	.panel-stack > :global(*) {
		flex: 1;
		min-height: 0;
	}

	.error-toast {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--danger);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		max-width: 300px;
		z-index: 100;
	}

	@media (max-width: 1200px) {
		.dashboard-main {
			grid-template-columns: 1fr 1fr;
		}

		.col-intel {
			grid-column: span 2;
		}
	}

	@media (max-width: 768px) {
		.dashboard-main {
			grid-template-columns: 1fr;
		}

		.col-intel {
			grid-column: span 1;
		}
	}
</style>

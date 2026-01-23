<script lang="ts">
	import type { Component } from 'svelte';
	import { MobileView } from '$lib/components/layout';
	import { mobileNavStore } from '$lib/stores/mobileNav.svelte';
	import {
		USPoliticsPanel,
		MarketsPanel,
		CryptoPanel,
		CommoditiesPanel,
		CourtCasesPanel,
		CongressPanel,
		AlertsPanel,
		SectorHeatmapPanel,
		PolymarketPanel,
		MainCharacterPanel,
		GovContractsPanel,
		LayoffsPanel,
		WorldLeadersPanel,
		CorrelationPanel,
		CustomMonitorsPanel,
		SituationWatchPanel
	} from '$lib/components/panels';
	import { SITUATIONS } from '$lib/config/situations';

	interface PanelConfig {
		id: string;
		title: string;
		icon: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		component: Component<any>;
		props?: Record<string, unknown>;
	}

	const panels: PanelConfig[] = [
		{ id: 'us-politics', title: 'US Politics', icon: '🏛️', component: USPoliticsPanel, props: { limit: 15 } },
		{ id: 'markets', title: 'Markets', icon: '📈', component: MarketsPanel },
		{ id: 'crypto', title: 'Crypto', icon: '₿', component: CryptoPanel },
		{ id: 'commodities', title: 'Commodities', icon: '🛢️', component: CommoditiesPanel },
		{ id: 'alerts', title: 'Alerts', icon: '🚨', component: AlertsPanel },
		{ id: 'court-cases', title: 'Court Cases', icon: '⚖️', component: CourtCasesPanel, props: { limit: 15 } },
		{ id: 'congress', title: 'Congress', icon: '📜', component: CongressPanel, props: { limit: 15 } },
		{ id: 'polymarket', title: 'Polymarket', icon: '🎲', component: PolymarketPanel },
		{ id: 'sector-heatmap', title: 'Sector Heatmap', icon: '🗺️', component: SectorHeatmapPanel },
		{ id: 'main-character', title: 'Main Character', icon: '👤', component: MainCharacterPanel },
		{ id: 'correlation', title: 'Correlation', icon: '🔗', component: CorrelationPanel },
		{ id: 'gov-contracts', title: 'Gov Contracts', icon: '📋', component: GovContractsPanel },
		{ id: 'layoffs', title: 'Layoffs', icon: '📉', component: LayoffsPanel },
		{ id: 'custom-monitors', title: 'Custom Monitors', icon: '👁️', component: CustomMonitorsPanel },
		{ id: 'world-leaders', title: 'World Leaders', icon: '🌍', component: WorldLeadersPanel }
	];

	function togglePanel(panelId: string) {
		mobileNavStore.toggleMorePanel(panelId);
	}
</script>

<MobileView title="More">
	<div class="accordion-container">
		{#each panels as panel (panel.id)}
			{@const isExpanded = mobileNavStore.isMoreExpanded(panel.id)}
			<div class="accordion-item">
				<button
					class="accordion-header"
					class:expanded={isExpanded}
					onclick={() => togglePanel(panel.id)}
					aria-expanded={isExpanded}
				>
					<span class="panel-icon">{panel.icon}</span>
					<span class="panel-title">{panel.title}</span>
					<span class="expand-icon">{isExpanded ? '−' : '+'}</span>
				</button>
				{#if isExpanded}
					<div class="accordion-content">
						<svelte:component this={panel.component} {...(panel.props || {})} />
					</div>
				{/if}
			</div>
		{/each}

		<!-- Situation Watches Section -->
		{#if SITUATIONS.length > 0}
			<div class="section-divider">
				<span>Situation Watches</span>
			</div>
			{#each SITUATIONS as situation (situation.id)}
				{@const isExpanded = mobileNavStore.isMoreExpanded(`situation-${situation.id}`)}
				<div class="accordion-item">
					<button
						class="accordion-header"
						class:expanded={isExpanded}
						onclick={() => togglePanel(`situation-${situation.id}`)}
						aria-expanded={isExpanded}
					>
						<span class="panel-icon">{situation.icon}</span>
						<span class="panel-title">{situation.title}</span>
						<span class="expand-icon">{isExpanded ? '−' : '+'}</span>
					</button>
					{#if isExpanded}
						<div class="accordion-content">
							<SituationWatchPanel
								id={situation.id}
								title={situation.title}
								description={situation.description}
								keywords={situation.keywords}
								icon={situation.icon}
							/>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</MobileView>

<style>
	.accordion-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.accordion-item {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.accordion-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.875rem 1rem;
		background: transparent;
		border: none;
		color: var(--text);
		font-size: 0.85rem;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.accordion-header:active {
		background: var(--surface-hover);
	}

	.accordion-header.expanded {
		border-bottom: 1px solid var(--border);
	}

	.panel-icon {
		font-size: 1.1rem;
		width: 1.5rem;
		text-align: center;
	}

	.panel-title {
		flex: 1;
		font-weight: 500;
	}

	.expand-icon {
		font-size: 1.25rem;
		color: var(--text-muted);
		font-weight: 300;
		width: 1.5rem;
		text-align: center;
	}

	.accordion-content {
		max-height: 400px;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		background: var(--bg);
	}

	.accordion-content :global(.panel) {
		border: none;
		border-radius: 0;
		background: transparent;
	}

	.accordion-content :global(.panel-header) {
		display: none;
	}

	.section-divider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 0;
		margin-top: 0.5rem;
	}

	.section-divider span {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.section-divider::before,
	.section-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border);
	}
</style>

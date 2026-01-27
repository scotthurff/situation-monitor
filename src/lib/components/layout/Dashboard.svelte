<script lang="ts">
	import { onMount } from 'svelte';
	import { refreshStore, settingsStore, mobileNavStore } from '$lib/stores';
	import { viewport } from '$lib/utils';
	import { Header, MobileNav } from '$lib/components/layout';
	import {
		MapPanel,
		NewsPanel,
		MarketsPanel,
		CryptoPanel,
		CommoditiesPanel,
		AlertsPanel,
		IntelPanel,
		USPoliticsPanel,
		CourtCasesPanel,
		CongressPanel,
		WorldLeadersPanel,
		PolymarketPanel,
		SectorHeatmapPanel,
		MainCharacterPanel,
		GovContractsPanel,
		LayoffsPanel,
		// New panels
		AINewsPanel,
		CorrelationPanel,
		NarrativePanel,
		SituationWatchPanel,
		CustomMonitorsPanel
	} from '$lib/components/panels';
	import {
		MobileNewsView,
		MobileMapView,
		MobileTrendsView,
		MobileIntelView,
		MobileMoreView
	} from '$lib/components/mobile';
	import { SITUATIONS } from '$lib/config/situations';

	onMount(() => {
		// Start auto-refresh if enabled
		if (settingsStore.autoRefreshEnabled) {
			refreshStore.startAutoRefresh();
		} else {
			// Still do initial refresh even if auto-refresh is disabled
			refreshStore.refresh();
		}

		return () => {
			refreshStore.stopAutoRefresh();
		};
	});
</script>

<div class="dashboard" class:mobile={viewport.isMobile}>
	<Header />

	{#if viewport.isMobile}
		<!-- Mobile Layout -->
		<main class="mobile-main">
			{#if mobileNavStore.activeTab === 'news'}
				<MobileNewsView />
			{:else if mobileNavStore.activeTab === 'map'}
				<MobileMapView />
			{:else if mobileNavStore.activeTab === 'trends'}
				<MobileTrendsView />
			{:else if mobileNavStore.activeTab === 'intel'}
				<MobileIntelView />
			{:else if mobileNavStore.activeTab === 'more'}
				<MobileMoreView />
			{/if}
		</main>
		<MobileNav />
	{:else}
		<!-- Desktop Layout -->
		<main class="dashboard-main">
			<!-- Map Panel - Full Width -->
			<div class="map-section">
				<MapPanel />
			</div>

			<!-- Panels Grid - CSS Columns -->
			<div class="panels-grid">
				<!-- ═══════════════════════════════════════════════════════════
				     TIER 1: Breaking / Trending (highest priority)
				     ═══════════════════════════════════════════════════════════ -->

				<!-- Narrative Tracker - What's trending right now -->
				<div class="panel-item">
					<NarrativePanel />
				</div>

				<!-- Pattern Analysis - Related patterns across sources -->
				<div class="panel-item">
					<CorrelationPanel />
				</div>

				<!-- Alerts - Breaking alerts -->
				<div class="panel-item">
					<AlertsPanel />
				</div>

				<!-- News Feed - Breaking news -->
				<div class="panel-item">
					<NewsPanel limit={25} />
				</div>

				<!-- US Politics - Timely political news -->
				<div class="panel-item">
					<USPoliticsPanel limit={20} />
				</div>

				<!-- AI News - Tech/AI breaking news -->
				<div class="panel-item">
					<AINewsPanel />
				</div>

				<!-- Intel - Intelligence updates -->
				<div class="panel-item">
					<IntelPanel />
				</div>

				<!-- ═══════════════════════════════════════════════════════════
				     TIER 2: Analysis / Patterns
				     ═══════════════════════════════════════════════════════════ -->

				<!-- Main Character - Who's trending -->
				<div class="panel-item">
					<MainCharacterPanel />
				</div>

				<!-- Custom Monitors - User-defined alerts -->
				<div class="panel-item">
					<CustomMonitorsPanel />
				</div>

				<!-- Situation Watches - User-defined monitoring -->
				{#each SITUATIONS as situation (situation.id)}
					<div class="panel-item">
						<SituationWatchPanel
							id={situation.id}
							title={situation.title}
							description={situation.description}
							keywords={situation.keywords}
							icon={situation.icon}
						/>
					</div>
				{/each}

				<!-- ═══════════════════════════════════════════════════════════
				     TIER 3: Markets (real-time but more reference)
				     ═══════════════════════════════════════════════════════════ -->

				<div class="panel-item">
					<MarketsPanel />
				</div>

				<div class="panel-item">
					<CryptoPanel />
				</div>

				<div class="panel-item">
					<CommoditiesPanel />
				</div>

				<div class="panel-item">
					<SectorHeatmapPanel />
				</div>

				<!-- ═══════════════════════════════════════════════════════════
				     TIER 4: Static / Reference Data (lowest priority)
				     ═══════════════════════════════════════════════════════════ -->

				<div class="panel-item">
					<CourtCasesPanel limit={15} />
				</div>

				<div class="panel-item">
					<CongressPanel limit={15} />
				</div>

				<div class="panel-item">
					<PolymarketPanel />
				</div>

				<div class="panel-item">
					<GovContractsPanel />
				</div>

				<div class="panel-item">
					<LayoffsPanel />
				</div>

				<div class="panel-item">
					<WorldLeadersPanel />
				</div>
			</div>
		</main>
	{/if}

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
		background: var(--bg);
	}

	.dashboard-main {
		padding: 0.75rem;
		max-width: 2000px;
		margin: 0 auto;
	}

	.map-section {
		margin-bottom: 0.75rem;
	}

	.panels-grid {
		columns: 1;
		column-gap: 0.75rem;
	}

	.panel-item {
		break-inside: avoid;
		margin-bottom: 0.75rem;
	}

	/* Responsive columns */
	@media (min-width: 600px) {
		.panels-grid {
			columns: 2;
		}
	}

	@media (min-width: 900px) {
		.panels-grid {
			columns: 3;
		}
	}

	@media (min-width: 1200px) {
		.panels-grid {
			columns: 4;
		}
	}

	@media (min-width: 1600px) {
		.panels-grid {
			columns: 5;
		}
	}

	@media (min-width: 2000px) {
		.panels-grid {
			columns: 6;
		}
	}

	.error-toast {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		background: var(--surface);
		border: 1px solid var(--red);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		max-width: 300px;
		z-index: 100;
	}

	/* Mobile styles */
	.dashboard.mobile {
		padding-bottom: calc(60px + env(safe-area-inset-bottom, 0));
	}

	.mobile-main {
		height: calc(100vh - 44px);
		overflow: hidden;
	}

	.dashboard.mobile .error-toast {
		bottom: calc(70px + env(safe-area-inset-bottom, 0));
	}
</style>

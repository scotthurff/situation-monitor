<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { newsStore } from '$lib/stores';
	import { detectCorrelations, detectCrossSourceCorrelations } from '$lib/analysis/correlation';
	import type { Correlation } from '$lib/types';

	// Detect correlations from current news
	const correlations = $derived(detectCorrelations(newsStore.news));
	const crossSourceCorrelations = $derived(detectCrossSourceCorrelations(newsStore.news));

	// Categorize correlations
	const emergingPatterns = $derived(
		correlations.filter((c) => c.severity === 'critical' || c.severity === 'high')
	);
	const momentumSignals = $derived(
		correlations.filter((c) => c.items.length >= 5 && c.confidence >= 0.6)
	);

	function getSeverityClass(severity: string): string {
		switch (severity) {
			case 'critical':
				return 'severity-critical';
			case 'high':
				return 'severity-high';
			case 'medium':
				return 'severity-medium';
			default:
				return 'severity-low';
		}
	}

	function getSeverityBadge(severity: string): string {
		switch (severity) {
			case 'critical':
				return 'CRITICAL';
			case 'high':
				return 'ELEVATED';
			default:
				return 'EMERGING';
		}
	}

	function formatConfidence(confidence: number): string {
		return `${Math.round(confidence * 100)}%`;
	}

	// Track expanded correlation
	let expandedId = $state<string | null>(null);

	function toggleExpanded(id: string): void {
		expandedId = expandedId === id ? null : id;
	}
</script>

<Panel
	id="correlation"
	title="Pattern Analysis"
	icon="🔗"
	count={correlations.length}
	loading={newsStore.isLoading}
>
	{#if correlations.length === 0 && crossSourceCorrelations.length === 0}
		<div class="empty-state">
			{newsStore.isLoading ? 'Analyzing patterns...' : 'No patterns detected yet'}
		</div>
	{:else}
		<div class="correlations-container">
			<!-- Emerging Patterns Section -->
			{#if emergingPatterns.length > 0}
				<div class="section">
					<div class="section-header">
						<span class="section-icon">⚠️</span>
						<span class="section-title">Emerging Patterns</span>
					</div>
					{#each emergingPatterns as correlation (correlation.id)}
						<button
							class="correlation-item {getSeverityClass(correlation.severity)}"
							onclick={() => toggleExpanded(correlation.id)}
						>
							<div class="correlation-header">
								<span class="correlation-topic">{correlation.topic}</span>
								<span class="status-badge {getSeverityClass(correlation.severity)}">
									{getSeverityBadge(correlation.severity)}
								</span>
							</div>
							<div class="correlation-meta">
								<span class="item-count">{correlation.items.length} items</span>
								<span class="confidence">{formatConfidence(correlation.confidence)} confidence</span>
							</div>
							{#if expandedId === correlation.id}
								<div class="correlation-items">
									{#each correlation.items.slice(0, 5) as item}
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="correlated-headline"
											onclick={(e) => e.stopPropagation()}
										>
											<span class="headline-source">{item.source}</span>
											<span class="headline-title">{item.title}</span>
										</a>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Momentum Signals Section -->
			{#if momentumSignals.length > 0}
				<div class="section">
					<div class="section-header">
						<span class="section-icon">📈</span>
						<span class="section-title">Momentum Signals</span>
					</div>
					{#each momentumSignals.slice(0, 5) as correlation (correlation.id)}
						<button
							class="correlation-item momentum"
							onclick={() => toggleExpanded(correlation.id)}
						>
							<div class="correlation-header">
								<span class="correlation-topic">{correlation.topic}</span>
								<span class="momentum-indicator">↑</span>
							</div>
							<div class="correlation-meta">
								<span class="item-count">{correlation.items.length} mentions</span>
								<span class="confidence">{formatConfidence(correlation.confidence)}</span>
							</div>
							{#if expandedId === correlation.id}
								<div class="correlation-items">
									{#each correlation.items.slice(0, 3) as item}
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="correlated-headline"
											onclick={(e) => e.stopPropagation()}
										>
											<span class="headline-source">{item.source}</span>
											<span class="headline-title">{item.title}</span>
										</a>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Cross-Source Links Section -->
			{#if crossSourceCorrelations.length > 0}
				<div class="section">
					<div class="section-header">
						<span class="section-icon">🌐</span>
						<span class="section-title">Cross-Source Links</span>
					</div>
					{#each crossSourceCorrelations.slice(0, 5) as correlation (correlation.id)}
						<button
							class="correlation-item cross-source"
							onclick={() => toggleExpanded(correlation.id)}
						>
							<div class="correlation-header">
								<span class="correlation-topic">{correlation.topic}</span>
								<span class="source-count">{correlation.items.length} sources</span>
							</div>
							{#if expandedId === correlation.id}
								<div class="correlation-items">
									{#each correlation.items.slice(0, 4) as item}
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="correlated-headline"
											onclick={(e) => e.stopPropagation()}
										>
											<span class="headline-source">{item.source}</span>
											<span class="headline-title">{item.title}</span>
										</a>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</Panel>

<style>
	.empty-state {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.7rem;
		padding: 1rem;
	}

	.correlations-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid var(--border);
	}

	.section-icon {
		font-size: 0.7rem;
	}

	.section-title {
		font-size: 0.6rem;
		font-weight: 600;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.correlation-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		border-radius: 0.25rem;
		cursor: pointer;
		text-align: left;
		width: 100%;
	}

	.correlation-item:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.correlation-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.correlation-topic {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text);
	}

	.status-badge {
		font-size: 0.5rem;
		padding: 0.1rem 0.3rem;
		border-radius: 0.15rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.status-badge.severity-critical {
		background: rgba(255, 68, 68, 0.2);
		color: var(--red);
	}

	.status-badge.severity-high {
		background: rgba(255, 180, 68, 0.2);
		color: var(--yellow);
	}

	.momentum-indicator {
		font-size: 0.8rem;
		color: var(--green);
		font-weight: bold;
	}

	.source-count {
		font-size: 0.55rem;
		color: var(--accent);
	}

	.correlation-meta {
		display: flex;
		gap: 0.75rem;
		font-size: 0.55rem;
		color: var(--text-muted);
	}

	.item-count,
	.confidence {
		opacity: 0.8;
	}

	.correlation-items {
		margin-top: 0.375rem;
		padding-top: 0.375rem;
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.correlated-headline {
		display: flex;
		flex-direction: column;
		padding: 0.25rem 0;
		text-decoration: none;
	}

	.correlated-headline:hover .headline-title {
		color: var(--accent);
	}

	.headline-source {
		font-size: 0.5rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.headline-title {
		font-size: 0.6rem;
		color: var(--text);
		line-height: 1.3;
		transition: color 0.15s;
	}

	.correlation-item.severity-critical {
		border-left: 2px solid var(--red);
	}

	.correlation-item.severity-high {
		border-left: 2px solid var(--yellow);
	}

	.correlation-item.momentum {
		border-left: 2px solid var(--green);
	}

	.correlation-item.cross-source {
		border-left: 2px solid var(--accent);
	}
</style>

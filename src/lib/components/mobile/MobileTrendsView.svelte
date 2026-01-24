<script lang="ts">
	import { MobileView } from '$lib/components/layout';
	import { newsStore } from '$lib/stores';
	import { trackNarratives } from '$lib/analysis/narrative';
	import { formatRelativeTime, getTimestampColor } from '$lib/utils';
	import type { Narrative } from '$lib/types';

	// Track narratives from current news
	const narratives = $derived(trackNarratives(newsStore.news));

	// Group by stage
	const risingNarratives = $derived(narratives.filter((n) => n.trajectory === 'rising'));
	const stableNarratives = $derived(narratives.filter((n) => n.trajectory === 'stable'));
	const fallingNarratives = $derived(narratives.filter((n) => n.trajectory === 'falling'));

	// Track expanded narrative
	let expandedId = $state<string | null>(null);

	function toggleExpanded(id: string): void {
		expandedId = expandedId === id ? null : id;
	}

	function getStageClass(stage: Narrative['stage']): string {
		switch (stage) {
			case 'emerging':
				return 'stage-emerging';
			case 'developing':
				return 'stage-developing';
			case 'mainstream':
				return 'stage-mainstream';
			case 'declining':
				return 'stage-declining';
			default:
				return '';
		}
	}

	function getTrajectoryIcon(trajectory: Narrative['trajectory']): string {
		switch (trajectory) {
			case 'rising':
				return '↑';
			case 'stable':
				return '→';
			case 'falling':
				return '↓';
			default:
				return '•';
		}
	}

	function getTrajectoryClass(trajectory: Narrative['trajectory']): string {
		switch (trajectory) {
			case 'rising':
				return 'trajectory-rising';
			case 'stable':
				return 'trajectory-stable';
			case 'falling':
				return 'trajectory-falling';
			default:
				return '';
		}
	}
</script>

<MobileView title="Trending Stories">
	{#if narratives.length === 0}
		<div class="empty-state">
			{newsStore.isLoading ? 'Tracking narratives...' : 'No narratives detected yet'}
		</div>
	{:else}
		<div class="narratives-container">
			<!-- Rising Section -->
			{#if risingNarratives.length > 0}
				<div class="section">
					<div class="section-header">
						<span class="section-icon">🔥</span>
						<span class="section-title">Rising Stories</span>
						<span class="section-count">{risingNarratives.length}</span>
					</div>
					{#each risingNarratives as narrative (narrative.id)}
						{@const isExpanded = expandedId === narrative.id}
						<button
							class="narrative-item"
							class:expanded={isExpanded}
							onclick={() => toggleExpanded(narrative.id)}
						>
							<div class="narrative-header">
								<span class="narrative-topic">{narrative.topic}</span>
								<span class="trajectory {getTrajectoryClass(narrative.trajectory)}">
									{getTrajectoryIcon(narrative.trajectory)}
								</span>
							</div>
							<div class="narrative-meta">
								<span class="stage-badge {getStageClass(narrative.stage)}">
									{narrative.stage}
								</span>
								<span class="mentions">{narrative.mentions} mentions</span>
								<span class="sources">{narrative.sources.length} sources</span>
							</div>
							{#if isExpanded && narrative.items.length > 0}
								<div class="expanded-items">
									{#each narrative.items.slice(0, 5) as item (item.id)}
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="news-link"
											onclick={(e) => e.stopPropagation()}
										>
											<span class="news-source">{item.source}</span>
											<span class="news-title">{item.title}</span>
											<span class="news-time" style="color: {getTimestampColor(item.pubDate)}">{formatRelativeTime(item.pubDate)}</span>
										</a>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Stable Section -->
			{#if stableNarratives.length > 0}
				<div class="section">
					<div class="section-header">
						<span class="section-icon">📰</span>
						<span class="section-title">Active Stories</span>
						<span class="section-count">{stableNarratives.length}</span>
					</div>
					{#each stableNarratives.slice(0, 8) as narrative (narrative.id)}
						{@const isExpanded = expandedId === narrative.id}
						<button
							class="narrative-item"
							class:expanded={isExpanded}
							onclick={() => toggleExpanded(narrative.id)}
						>
							<div class="narrative-header">
								<span class="narrative-topic">{narrative.topic}</span>
								<span class="trajectory {getTrajectoryClass(narrative.trajectory)}">
									{getTrajectoryIcon(narrative.trajectory)}
								</span>
							</div>
							<div class="narrative-meta">
								<span class="stage-badge {getStageClass(narrative.stage)}">
									{narrative.stage}
								</span>
								<span class="mentions">{narrative.mentions}</span>
							</div>
							{#if isExpanded && narrative.items.length > 0}
								<div class="expanded-items">
									{#each narrative.items.slice(0, 5) as item (item.id)}
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="news-link"
											onclick={(e) => e.stopPropagation()}
										>
											<span class="news-source">{item.source}</span>
											<span class="news-title">{item.title}</span>
											<span class="news-time" style="color: {getTimestampColor(item.pubDate)}">{formatRelativeTime(item.pubDate)}</span>
										</a>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Declining Section -->
			{#if fallingNarratives.length > 0}
				<div class="section">
					<div class="section-header">
						<span class="section-icon">📉</span>
						<span class="section-title">Declining</span>
						<span class="section-count">{fallingNarratives.length}</span>
					</div>
					{#each fallingNarratives.slice(0, 5) as narrative (narrative.id)}
						{@const isExpanded = expandedId === narrative.id}
						<button
							class="narrative-item declining"
							class:expanded={isExpanded}
							onclick={() => toggleExpanded(narrative.id)}
						>
							<div class="narrative-header">
								<span class="narrative-topic">{narrative.topic}</span>
								<span class="trajectory {getTrajectoryClass(narrative.trajectory)}">
									{getTrajectoryIcon(narrative.trajectory)}
								</span>
							</div>
							<div class="narrative-meta">
								<span class="mentions">{narrative.mentions}</span>
								<span class="last-seen" style="color: {getTimestampColor(narrative.lastSeen)}">Last: {formatRelativeTime(narrative.lastSeen)}</span>
							</div>
							{#if isExpanded && narrative.items.length > 0}
								<div class="expanded-items">
									{#each narrative.items.slice(0, 5) as item (item.id)}
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="news-link"
											onclick={(e) => e.stopPropagation()}
										>
											<span class="news-source">{item.source}</span>
											<span class="news-title">{item.title}</span>
											<span class="news-time" style="color: {getTimestampColor(item.pubDate)}">{formatRelativeTime(item.pubDate)}</span>
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
</MobileView>

<style>
	.empty-state {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.85rem;
		padding: 2rem 1rem;
	}

	.narratives-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-bottom: 0.375rem;
		border-bottom: 1px solid var(--border);
	}

	.section-icon {
		font-size: 0.85rem;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		flex: 1;
	}

	.section-count {
		font-size: 0.65rem;
		color: var(--text-muted);
		background: var(--border);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.narrative-item {
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		border-radius: 0.375rem;
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition: background-color 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.narrative-item:active {
		background: rgba(255, 255, 255, 0.06);
	}

	.narrative-item.expanded {
		background: rgba(255, 255, 255, 0.04);
		border-color: var(--accent);
	}

	.narrative-item.declining {
		opacity: 0.7;
	}

	.narrative-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.narrative-topic {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text);
		flex: 1;
		text-transform: capitalize;
	}

	.trajectory {
		font-size: 1rem;
		font-weight: bold;
	}

	.trajectory-rising {
		color: var(--green);
	}

	.trajectory-stable {
		color: var(--text-muted);
	}

	.trajectory-falling {
		color: var(--red);
	}

	.narrative-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.375rem;
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.stage-badge {
		padding: 0.125rem 0.375rem;
		border-radius: 0.2rem;
		font-size: 0.6rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.stage-emerging {
		background: rgba(100, 255, 100, 0.2);
		color: var(--green);
	}

	.stage-developing {
		background: rgba(100, 200, 255, 0.2);
		color: var(--accent);
	}

	.stage-mainstream {
		background: rgba(180, 160, 100, 0.15);
		color: #a89060;
	}

	.stage-declining {
		background: rgba(150, 150, 150, 0.2);
		color: var(--text-muted);
	}

	.expanded-items {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.news-link {
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 0.25rem;
		text-decoration: none;
	}

	.news-link:active {
		background: rgba(0, 0, 0, 0.3);
	}

	.news-source {
		font-size: 0.6rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.125rem;
	}

	.news-title {
		font-size: 0.75rem;
		color: var(--text);
		line-height: 1.3;
	}

	.news-time {
		font-size: 0.6rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>

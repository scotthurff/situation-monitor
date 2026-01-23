<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { newsStore } from '$lib/stores';
	import { trackNarratives, findEmergingNarratives } from '$lib/analysis/narrative';
	import { formatRelativeTime } from '$lib/utils';
	import type { Narrative } from '$lib/types';

	// Track narratives from current news
	const narratives = $derived(trackNarratives(newsStore.news));
	const emergingNarratives = $derived(findEmergingNarratives(newsStore.news));

	// Group by stage
	const risingNarratives = $derived(narratives.filter((n) => n.trajectory === 'rising'));
	const stableNarratives = $derived(narratives.filter((n) => n.trajectory === 'stable'));
	const fallingNarratives = $derived(narratives.filter((n) => n.trajectory === 'falling'));

	// Track expanded narrative
	let expandedId = $state<string | null>(null);

	function toggleExpanded(id: string, event: MouseEvent): void {
		const isExpanding = expandedId !== id;
		expandedId = expandedId === id ? null : id;

		// Scroll the clicked item into view when expanding
		if (isExpanding && event.currentTarget instanceof HTMLElement) {
			const element = event.currentTarget;
			// Small delay to let the DOM update with expanded content
			setTimeout(() => {
				element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}, 50);
		}
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

	function formatSourceTiers(sources: string[]): { mainstream: number; alt: number } {
		const mainstreamSources = [
			'BBC World',
			'NPR News',
			'Guardian World',
			'NYT World',
			'CNBC',
			'Bloomberg',
			'Reuters',
			'AP News'
		];

		const mainstream = sources.filter((s) => mainstreamSources.includes(s)).length;
		return {
			mainstream,
			alt: sources.length - mainstream
		};
	}
</script>

<Panel
	id="narrative"
	title="Narrative Tracker"
	icon="📊"
	count={narratives.length}
	loading={newsStore.isLoading}
>
	{#if narratives.length === 0}
		<div class="empty-state">
			{newsStore.isLoading ? 'Tracking narratives...' : 'No narratives detected yet'}
		</div>
	{:else}
		<div class="narratives-container">
			<!-- Emerging / Rising Section -->
			{#if risingNarratives.length > 0}
				<div class="section">
					<div class="section-header">
						<span class="section-icon">🔥</span>
						<span class="section-title">Rising Stories</span>
						<span class="section-count">{risingNarratives.length}</span>
					</div>
					{#each risingNarratives.slice(0, 8) as narrative (narrative.id)}
						{@const tiers = formatSourceTiers(narrative.sources)}
						{@const isExpanded = expandedId === narrative.id}
						<button
							class="narrative-item {getStageClass(narrative.stage)}"
							class:expanded={isExpanded}
							onclick={(e) => toggleExpanded(narrative.id, e)}
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
							</div>
							<div class="narrative-details">
								<div class="source-breakdown">
									{#if tiers.mainstream > 0}
										<span class="tier-mainstream">{tiers.mainstream} mainstream</span>
									{/if}
									{#if tiers.alt > 0}
										<span class="tier-alt">{tiers.alt} alt/specialist</span>
									{/if}
								</div>
								<div class="timeline">
									<span class="first-seen">First: {formatRelativeTime(narrative.firstSeen)}</span>
									<span class="last-seen">Latest: {formatRelativeTime(narrative.lastSeen)}</span>
								</div>
							</div>
							{#if isExpanded && narrative.items.length > 0}
								<div class="expanded-items">
									{#each narrative.items as item (item.id)}
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="news-link"
											title={item.title}
											onclick={(e) => e.stopPropagation()}
										>
											<span class="news-source">{item.source}</span>
											<span class="news-title">{item.title}</span>
											<span class="news-time">{formatRelativeTime(item.pubDate)}</span>
										</a>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Stable Stories -->
			{#if stableNarratives.length > 0}
				<div class="section">
					<div class="section-header">
						<span class="section-icon">📰</span>
						<span class="section-title">Active Stories</span>
						<span class="section-count">{stableNarratives.length}</span>
					</div>
					{#each stableNarratives.slice(0, 5) as narrative (narrative.id)}
						{@const tiers = formatSourceTiers(narrative.sources)}
						{@const isExpanded = expandedId === narrative.id}
						<button
							class="narrative-item {getStageClass(narrative.stage)}"
							class:expanded={isExpanded}
							onclick={(e) => toggleExpanded(narrative.id, e)}
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
								<span class="sources-count">{narrative.sources.length} sources</span>
							</div>
							{#if isExpanded && narrative.items.length > 0}
								<div class="expanded-items">
									{#each narrative.items as item (item.id)}
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="news-link"
											title={item.title}
											onclick={(e) => e.stopPropagation()}
										>
											<span class="news-source">{item.source}</span>
											<span class="news-title">{item.title}</span>
											<span class="news-time">{formatRelativeTime(item.pubDate)}</span>
										</a>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Declining Stories -->
			{#if fallingNarratives.length > 0}
				<div class="section">
					<div class="section-header">
						<span class="section-icon">📉</span>
						<span class="section-title">Declining</span>
						<span class="section-count">{fallingNarratives.length}</span>
					</div>
					{#each fallingNarratives.slice(0, 3) as narrative (narrative.id)}
						{@const isExpanded = expandedId === narrative.id}
						<button
							class="narrative-item declining {getStageClass(narrative.stage)}"
							class:expanded={isExpanded}
							onclick={(e) => toggleExpanded(narrative.id, e)}
						>
							<div class="narrative-header">
								<span class="narrative-topic">{narrative.topic}</span>
								<span class="trajectory {getTrajectoryClass(narrative.trajectory)}">
									{getTrajectoryIcon(narrative.trajectory)}
								</span>
							</div>
							<div class="narrative-meta">
								<span class="mentions">{narrative.mentions}</span>
								<span class="last-seen">Last: {formatRelativeTime(narrative.lastSeen)}</span>
							</div>
							{#if isExpanded && narrative.items.length > 0}
								<div class="expanded-items">
									{#each narrative.items as item (item.id)}
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="news-link"
											title={item.title}
											onclick={(e) => e.stopPropagation()}
										>
											<span class="news-source">{item.source}</span>
											<span class="news-title">{item.title}</span>
											<span class="news-time">{formatRelativeTime(item.pubDate)}</span>
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

	.narratives-container {
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
		flex: 1;
	}

	.section-count {
		font-size: 0.55rem;
		color: var(--text-muted);
		background: var(--border);
		padding: 0.1rem 0.3rem;
		border-radius: 0.2rem;
	}

	.narrative-item {
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border);
		border-radius: 0.25rem;
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition: background-color 0.15s;
	}

	.narrative-item:hover {
		background: rgba(255, 255, 255, 0.05);
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
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text);
		flex: 1;
		text-transform: capitalize;
	}

	.trajectory {
		font-size: 0.8rem;
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
		margin-top: 0.25rem;
		font-size: 0.55rem;
		color: var(--text-muted);
	}

	.stage-badge {
		padding: 0.1rem 0.25rem;
		border-radius: 0.15rem;
		font-size: 0.5rem;
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

	.narrative-details {
		margin-top: 0.375rem;
		padding-top: 0.375rem;
		border-top: 1px solid var(--border);
		font-size: 0.55rem;
		color: var(--text-muted);
	}

	.source-breakdown {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.tier-mainstream {
		color: var(--accent);
	}

	.tier-alt {
		color: var(--text-muted);
	}

	.timeline {
		display: flex;
		gap: 0.75rem;
	}

	.first-seen,
	.last-seen {
		opacity: 0.7;
	}

	.mentions,
	.sources-count {
		opacity: 0.8;
	}

	/* Expanded items section */
	.expanded-items {
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		/* Fixed height with scroll to prevent panel reflow */
		max-height: 250px;
		overflow-y: auto;
	}

	.news-link {
		display: flex;
		flex-direction: column;
		padding: 0.375rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 0.2rem;
		text-decoration: none;
		transition: background-color 0.15s;
	}

	.news-link:hover {
		background: rgba(0, 0, 0, 0.3);
	}

	.news-link:hover .news-title {
		color: var(--accent);
	}

	.news-source {
		font-size: 0.5rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.125rem;
	}

	.news-title {
		font-size: 0.65rem;
		color: var(--text);
		line-height: 1.3;
		transition: color 0.15s;
		/* Truncate with ellipsis */
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.news-time {
		font-size: 0.5rem;
		color: var(--text-muted);
		margin-top: 0.125rem;
		opacity: 0.7;
	}
</style>

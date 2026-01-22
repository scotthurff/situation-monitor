<script lang="ts">
	import { Panel } from '$lib/components/common';
	import { newsStore } from '$lib/stores';
	import { POLITICAL_FIGURES } from '$lib/config/keywords';

	interface FigureMention {
		name: string;
		role: string;
		party?: string;
		mentions: number;
		sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
		recentHeadline?: string;
	}

	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Calculate mentions from news store
	const figureMentions = $derived(() => {
		const mentions: FigureMention[] = [];
		const news = newsStore.news;

		for (const [name, info] of Object.entries(POLITICAL_FIGURES)) {
			const aliases = [name.toLowerCase(), ...(info.aliases || [])];
			let mentionCount = 0;
			let positiveCount = 0;
			let negativeCount = 0;
			let recentHeadline: string | undefined;

			for (const item of news) {
				const titleLower = item.title.toLowerCase();
				const descLower = (item.description || '').toLowerCase();

				for (const alias of aliases) {
					if (titleLower.includes(alias) || descLower.includes(alias)) {
						mentionCount++;
						if (!recentHeadline) recentHeadline = item.title;
						if (item.sentiment === 'positive') positiveCount++;
						if (item.sentiment === 'negative') negativeCount++;
						break;
					}
				}
			}

			if (mentionCount > 0) {
				let sentiment: FigureMention['sentiment'] = 'neutral';
				if (positiveCount > negativeCount + 2) sentiment = 'positive';
				else if (negativeCount > positiveCount + 2) sentiment = 'negative';
				else if (positiveCount > 0 && negativeCount > 0) sentiment = 'mixed';

				mentions.push({
					name,
					role: info.role,
					party: info.party,
					mentions: mentionCount,
					sentiment,
					recentHeadline
				});
			}
		}

		return mentions.sort((a, b) => b.mentions - a.mentions).slice(0, 10);
	});

	const partyColors: Record<string, string> = {
		D: 'bg-blue-500',
		R: 'bg-red-500',
		I: 'bg-purple-500'
	};

	const sentimentColors: Record<string, string> = {
		positive: 'text-success',
		negative: 'text-danger',
		neutral: 'text-muted',
		mixed: 'text-warning'
	};
</script>

{#snippet header()}
	<div class="text-xs text-muted">
		Tracked figures by mention frequency
	</div>
{/snippet}

<Panel
	title="Political Figures"
	icon="👤"
	loading={isLoading || newsStore.isLoading}
	{error}
	{header}
>
	{#if figureMentions().length === 0}
		<div class="text-sm text-muted text-center py-4">
			{newsStore.isLoading ? 'Analyzing news...' : 'No political figure mentions detected'}
		</div>
	{:else}
		<div class="figures-list">
			{#each figureMentions() as figure}
				<div class="figure-item">
					<div class="figure-left">
						{#if figure.party}
							<span class="party-badge {partyColors[figure.party]}"></span>
						{/if}
						<div class="figure-info">
							<div class="figure-name">{figure.name}</div>
							<div class="figure-role">{figure.role}</div>
						</div>
					</div>
					<div class="figure-right">
						<div class="figure-mentions">{figure.mentions}</div>
						<div class="figure-sentiment {sentimentColors[figure.sentiment]}">
							{figure.sentiment}
						</div>
					</div>
				</div>
				{#if figure.recentHeadline}
					<div class="figure-headline">
						"{figure.recentHeadline.slice(0, 80)}{figure.recentHeadline.length > 80 ? '...' : ''}"
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.figures-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.figure-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 0.25rem;
	}

	.figure-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.party-badge {
		width: 4px;
		height: 24px;
		border-radius: 2px;
	}

	.figure-info {
		min-width: 0;
	}

	.figure-name {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.figure-role {
		font-size: 0.65rem;
		color: var(--text-muted);
	}

	.figure-right {
		text-align: right;
	}

	.figure-mentions {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
	}

	.figure-sentiment {
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.figure-headline {
		font-size: 0.65rem;
		color: var(--text-muted);
		padding: 0 0.5rem 0.5rem;
		font-style: italic;
		line-height: 1.3;
	}
</style>

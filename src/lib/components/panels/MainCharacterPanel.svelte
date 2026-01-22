<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import { fetchMainCharacters } from '$lib/api/entities';
	import type { MainCharacter } from '$lib/types';

	let characters: MainCharacter[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	function getSentimentClass(sentiment: string): string {
		switch (sentiment) {
			case 'positive':
				return 'sentiment-positive';
			case 'negative':
				return 'sentiment-negative';
			case 'mixed':
				return 'sentiment-mixed';
			default:
				return 'sentiment-neutral';
		}
	}

	function getSentimentIcon(sentiment: string): string {
		switch (sentiment) {
			case 'positive':
				return '📈';
			case 'negative':
				return '📉';
			case 'mixed':
				return '📊';
			default:
				return '➖';
		}
	}

	async function loadCharacters() {
		loading = true;
		error = null;
		try {
			characters = await fetchMainCharacters();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load characters';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadCharacters();
	});
</script>

<Panel id="main-character" title="Main Character" icon="👤" count={characters.length} {loading} {error}>
	{#if characters.length === 0 && !loading && !error}
		<div class="empty-state">No character data available</div>
	{:else}
		<div class="characters-list">
			{#each characters as char, i (char.name)}
				<div class="character-item">
					<div class="character-rank">#{i + 1}</div>
					<div class="character-info">
						<div class="character-name">{char.name}</div>
						<div class="character-sources">{char.sources.slice(0, 3).join(', ')}</div>
					</div>
					<div class="character-stats">
						<span class="character-mentions">{char.mentions}</span>
						<span class="character-sentiment {getSentimentClass(char.sentiment)}">
							{getSentimentIcon(char.sentiment)}
						</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.characters-list {
		display: flex;
		flex-direction: column;
	}

	.character-item {
		display: flex;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
		gap: 0.5rem;
	}

	.character-item:last-child {
		border-bottom: none;
	}

	.character-rank {
		font-size: 0.6rem;
		color: var(--text-muted);
		width: 1.5rem;
		text-align: center;
	}

	.character-info {
		flex: 1;
		min-width: 0;
	}

	.character-name {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text);
	}

	.character-sources {
		font-size: 0.55rem;
		color: var(--text-muted);
		margin-top: 0.1rem;
	}

	.character-stats {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.character-mentions {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--yellow);
		font-variant-numeric: tabular-nums;
	}

	.character-sentiment {
		font-size: 0.8rem;
	}

	.empty-state {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>

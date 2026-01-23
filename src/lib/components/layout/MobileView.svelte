<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		children: Snippet;
		noPadding?: boolean;
	}

	let { title, children, noPadding = false }: Props = $props();
</script>

<div class="mobile-view" class:no-padding={noPadding}>
	{#if title}
		<div class="view-header">
			<h2 class="view-title">{title}</h2>
		</div>
	{/if}
	<div class="view-content" class:has-title={!!title}>
		{@render children()}
	</div>
</div>

<style>
	.mobile-view {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 44px - 60px - env(safe-area-inset-bottom, 0));
		overflow: hidden;
		background: var(--bg);
	}

	.mobile-view.no-padding .view-content {
		padding: 0;
	}

	.view-header {
		padding: 0.75rem 1rem;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.view-title {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text);
	}

	.view-content {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
		padding: 0.75rem;
	}

	.view-content.has-title {
		height: calc(100% - 44px);
	}
</style>

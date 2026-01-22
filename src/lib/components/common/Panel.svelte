<script lang="ts">
	import { formatRelativeTime } from '$lib/utils/format';

	interface Props {
		id?: string;
		title: string;
		icon?: string;
		count?: number;
		loading?: boolean;
		error?: string | null;
		lastUpdated?: Date | null;
		children?: import('svelte').Snippet;
		header?: import('svelte').Snippet;
	}

	let { id, title, icon = '', count, loading = false, error = null, lastUpdated = null, children, header }: Props = $props();

	// Re-render relative time every 30 seconds
	let now = $state(Date.now());

	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 30000);
		return () => clearInterval(interval);
	});

	// Format the relative time string
	const relativeTimeStr = $derived(() => {
		if (!lastUpdated) return null;
		// Force recalc by using 'now'
		void now;
		return formatRelativeTime(lastUpdated);
	});
</script>

<div class="panel" {id}>
	<div class="panel-header">
		{#if icon}
			<span class="panel-icon">{icon}</span>
		{/if}
		<span class="panel-title">{title.toUpperCase()}</span>
		{#if count !== undefined}
			<span class="panel-count">{count}</span>
		{/if}
		{#if loading}
			<span class="panel-loading">
				<span class="spinner"></span>
			</span>
		{/if}
		{#if relativeTimeStr()}
			<span class="panel-updated">Updated {relativeTimeStr()}</span>
		{/if}
	</div>

	{#if header}
		<div class="panel-subheader">
			{@render header()}
		</div>
	{/if}

	{#if error}
		<div class="panel-error">
			{error}
		</div>
	{/if}

	<div class="panel-content">
		{@render children?.()}
	</div>
</div>

<style>
	.panel {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
	}

	.panel-header {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-dim);
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.panel-icon {
		font-size: 0.85rem;
	}

	.panel-title {
		flex: 1;
	}

	.panel-count {
		font-size: 0.65rem;
		color: var(--text-muted);
		background: var(--border);
		padding: 0.1rem 0.4rem;
		border-radius: 3px;
	}

	.panel-loading {
		margin-left: auto;
	}

	.panel-updated {
		font-size: 0.6rem;
		color: var(--text-muted);
		font-weight: 400;
		letter-spacing: normal;
	}

	.spinner {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: 2px solid var(--border-light);
		border-top-color: var(--text-dim);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}

	.panel-subheader {
		margin-bottom: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.panel-error {
		font-size: 0.7rem;
		color: var(--red);
		background: rgba(255, 68, 68, 0.1);
		border-radius: 3px;
		padding: 0.5rem;
		margin-bottom: 0.5rem;
	}
</style>

<script lang="ts">
	interface Props {
		title: string;
		icon?: string;
		loading?: boolean;
		error?: string | null;
		children?: import('svelte').Snippet;
		header?: import('svelte').Snippet;
	}

	let { title, icon = '', loading = false, error = null, children, header }: Props = $props();
</script>

<div class="panel">
	<div class="panel-header">
		{#if icon}
			<span class="text-lg">{icon}</span>
		{/if}
		<span>{title}</span>
		{#if loading}
			<span class="ml-auto">
				<span class="inline-block w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></span>
			</span>
		{/if}
	</div>

	{#if header}
		<div class="panel-subheader">
			{@render header()}
		</div>
	{/if}

	{#if error}
		<div class="text-sm text-danger bg-danger/10 rounded px-3 py-2 mb-3">
			{error}
		</div>
	{/if}

	<div class="panel-content">
		{@render children?.()}
	</div>
</div>

<style>
	.panel {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		padding: 1rem;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.panel-header {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
</style>

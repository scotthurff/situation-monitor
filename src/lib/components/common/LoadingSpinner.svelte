<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		text?: string;
	}

	let { size = 'md', text = '' }: Props = $props();

	const sizes = {
		sm: 'w-4 h-4 border-2',
		md: 'w-8 h-8 border-2',
		lg: 'w-12 h-12 border-3'
	};
</script>

<div class="flex items-center justify-center gap-3">
	<div class="spinner {sizes[size]}"></div>
	{#if text}
		<span class="text-sm text-muted">{text}</span>
	{/if}
</div>

<style>
	.spinner {
		border-color: var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>

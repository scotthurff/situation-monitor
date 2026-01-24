<script lang="ts">
	import { formatRelativeTime, getTimestampColor } from '$lib/utils';
	import type { NewsItem } from '$lib/types';

	interface Props {
		item: NewsItem;
	}

	let { item }: Props = $props();

	const severityColors: Record<string, string> = {
		critical: 'bg-danger/20 text-danger',
		high: 'bg-warning/20 text-warning',
		medium: 'bg-accent/20 text-accent',
		low: 'bg-muted/20 text-muted'
	};
</script>

<a
	href={item.link}
	target="_blank"
	rel="noopener noreferrer"
	class="news-item block"
>
	<div class="flex items-start gap-2">
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-1">
				<span class="news-source">{item.source}</span>
				{#if item.severity}
					<span class="badge {severityColors[item.severity] || ''}">
						{item.severity}
					</span>
				{/if}
			</div>
			<h3 class="news-title line-clamp-2">
				{item.title}
			</h3>
			<div class="flex items-center gap-2 mt-1">
				<span class="news-time" style="color: {getTimestampColor(item.pubDate)}">{formatRelativeTime(item.pubDate)}</span>
				{#if item.regions && item.regions.length > 0}
					<span class="text-xs text-muted/70">
						{item.regions.slice(0, 2).join(', ')}
					</span>
				{/if}
			</div>
		</div>
	</div>
</a>

<style>
	.news-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
		transition: background-color 0.15s;
	}

	.news-item:last-child {
		border-bottom: none;
	}

	.news-item:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.news-source {
		font-size: 0.65rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.news-title {
		font-size: 0.7rem;
		color: var(--text-primary);
		transition: color 0.15s;
		line-height: 1.4;
	}

	.news-item:hover .news-title {
		color: var(--accent);
	}

	.news-time {
		font-size: 0.65rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.badge {
		font-size: 0.6rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-weight: 500;
		text-transform: uppercase;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>

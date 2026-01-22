<script lang="ts">
	interface Props {
		data: number[];
		width?: number;
		height?: number;
		color?: string;
		strokeWidth?: number;
	}

	let {
		data,
		width = 80,
		height = 24,
		color,
		strokeWidth = 1.5
	}: Props = $props();

	// Auto-detect color based on trend (first vs last value)
	const autoColor = $derived.by(() => {
		if (color) return color;
		if (!data || data.length < 2) return 'var(--text-muted)';
		const first = data[0];
		const last = data[data.length - 1];
		return last >= first ? 'var(--green)' : 'var(--red)';
	});

	// Generate SVG path from data points
	const pathData = $derived.by(() => {
		if (!data || data.length < 2) return '';

		const min = Math.min(...data);
		const max = Math.max(...data);
		const range = max - min || 1;

		// Padding to prevent clipping at edges
		const padding = 2;
		const innerWidth = width - padding * 2;
		const innerHeight = height - padding * 2;

		// Generate points
		const points = data.map((value, index) => {
			const x = padding + (index / (data.length - 1)) * innerWidth;
			const y = padding + innerHeight - ((value - min) / range) * innerHeight;
			return { x, y };
		});

		// Build path string
		const pathParts = points.map((point, index) => {
			if (index === 0) return `M ${point.x} ${point.y}`;
			return `L ${point.x} ${point.y}`;
		});

		return pathParts.join(' ');
	});
</script>

{#if data && data.length >= 2}
	<svg
		{width}
		{height}
		viewBox="0 0 {width} {height}"
		class="sparkline"
		role="img"
		aria-label="7-day price chart"
	>
		<path
			d={pathData}
			fill="none"
			stroke={autoColor}
			stroke-width={strokeWidth}
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{:else}
	<div class="sparkline-placeholder" style="width: {width}px; height: {height}px;">
		<span class="text-muted">--</span>
	</div>
{/if}

<style>
	.sparkline {
		display: block;
		flex-shrink: 0;
	}

	.sparkline-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6rem;
		color: var(--text-dim);
	}
</style>

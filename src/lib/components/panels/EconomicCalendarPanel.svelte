<script lang="ts">
	import { Panel } from '$lib/components/common';

	interface CalendarEvent {
		name: string;
		date: string;
		time: string;
		importance: 'high' | 'medium' | 'low';
		actual?: string;
		forecast?: string;
		previous?: string;
		isPast: boolean;
	}

	// Mock upcoming events - will be replaced with real data
	let events = $state<CalendarEvent[]>([
		{ name: 'Initial Jobless Claims', date: 'Thu Jan 23', time: '8:30 AM', importance: 'high', forecast: '220K', previous: '217K', isPast: false },
		{ name: 'Existing Home Sales', date: 'Fri Jan 24', time: '10:00 AM', importance: 'medium', forecast: '4.20M', previous: '4.15M', isPast: false },
		{ name: 'Michigan Sentiment (Final)', date: 'Fri Jan 24', time: '10:00 AM', importance: 'medium', forecast: '73.2', previous: '74.0', isPast: false },
		{ name: 'FOMC Meeting', date: 'Wed Jan 29', time: '2:00 PM', importance: 'high', isPast: false },
		{ name: 'GDP (Advance Q4)', date: 'Thu Jan 30', time: '8:30 AM', importance: 'high', forecast: '2.5%', previous: '3.1%', isPast: false },
		{ name: 'Initial Jobless Claims', date: 'Thu Jan 30', time: '8:30 AM', importance: 'high', forecast: '222K', previous: '?', isPast: false },
		{ name: 'PCE Inflation', date: 'Fri Jan 31', time: '8:30 AM', importance: 'high', forecast: '2.6%', previous: '2.4%', isPast: false },
		{ name: 'Employment Situation', date: 'Fri Feb 7', time: '8:30 AM', importance: 'high', forecast: '+170K', previous: '+256K', isPast: false },
		{ name: 'CPI', date: 'Wed Feb 12', time: '8:30 AM', importance: 'high', forecast: '2.8%', previous: '2.9%', isPast: false }
	]);

	let isLoading = $state(false);
	let error = $state<string | null>(null);

	const importanceColors: Record<string, string> = {
		high: 'bg-danger/20 text-danger border-danger/30',
		medium: 'bg-warning/20 text-warning border-warning/30',
		low: 'bg-muted/20 text-muted border-muted/30'
	};

	const importanceDots: Record<string, string> = {
		high: 'bg-danger',
		medium: 'bg-warning',
		low: 'bg-muted'
	};
</script>

{#snippet header()}
	<div class="flex items-center gap-2 text-xs">
		<span class="flex items-center gap-1">
			<span class="w-2 h-2 rounded-full bg-danger"></span> High
		</span>
		<span class="flex items-center gap-1">
			<span class="w-2 h-2 rounded-full bg-warning"></span> Medium
		</span>
	</div>
{/snippet}

<Panel title="Economic Calendar" icon="📅" loading={isLoading} {error} {header}>
	<div class="calendar-list">
		{#each events as event}
			<div class="calendar-item" class:past={event.isPast}>
				<div class="calendar-left">
					<div class="calendar-importance">
						<span class="importance-dot {importanceDots[event.importance]}"></span>
					</div>
					<div class="calendar-datetime">
						<div class="calendar-date">{event.date}</div>
						<div class="calendar-time">{event.time}</div>
					</div>
				</div>
				<div class="calendar-right">
					<div class="calendar-name">{event.name}</div>
					{#if event.forecast || event.previous}
						<div class="calendar-values">
							{#if event.forecast}
								<span class="calendar-forecast">F: {event.forecast}</span>
							{/if}
							{#if event.previous}
								<span class="calendar-previous">P: {event.previous}</span>
							{/if}
							{#if event.actual}
								<span class="calendar-actual">A: {event.actual}</span>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</Panel>

<style>
	.calendar-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.calendar-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.375rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 0.25rem;
		border: 1px solid var(--border);
	}

	.calendar-item.past {
		opacity: 0.5;
	}

	.calendar-left {
		display: flex;
		align-items: flex-start;
		gap: 0.375rem;
		flex-shrink: 0;
	}

	.importance-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		margin-top: 0.375rem;
	}

	.calendar-datetime {
		min-width: 70px;
	}

	.calendar-date {
		font-size: 0.7rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.calendar-time {
		font-size: 0.6rem;
		color: var(--text-muted);
	}

	.calendar-right {
		flex: 1;
		min-width: 0;
	}

	.calendar-name {
		font-size: 0.75rem;
		color: var(--text-primary);
		line-height: 1.3;
	}

	.calendar-values {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.125rem;
		font-size: 0.6rem;
		font-family: 'JetBrains Mono', monospace;
	}

	.calendar-forecast {
		color: var(--text-muted);
	}

	.calendar-previous {
		color: var(--text-muted);
		opacity: 0.7;
	}

	.calendar-actual {
		color: var(--accent);
		font-weight: 600;
	}
</style>

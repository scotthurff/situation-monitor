<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import { fetchCombinedCalendar } from '$lib/api/calendar';
	import type { EconomicEvent } from '$lib/api/calendar';

	let events: EconomicEvent[] = $state([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	const count = $derived(events.length);

	// Group events by date
	const groupedEvents = $derived(() => {
		const groups = new Map<string, EconomicEvent[]>();
		const now = new Date();

		for (const event of events) {
			// Mark past events
			const isPast = event.date < now;
			const dateKey = event.date.toLocaleDateString('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric'
			});

			const list = groups.get(dateKey) || [];
			list.push({ ...event, isPast } as EconomicEvent & { isPast: boolean });
			groups.set(dateKey, list);
		}

		return groups;
	});

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

	function isEventPast(event: EconomicEvent): boolean {
		return event.date < new Date();
	}

	async function loadCalendar() {
		isLoading = true;
		error = null;
		try {
			events = await fetchCombinedCalendar();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load calendar';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadCalendar();
	});
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

<Panel title="Economic Calendar" icon="📅" {count} loading={isLoading} {error} {header}>
	{#if events.length === 0 && !isLoading && !error}
		<div class="empty-state">No upcoming events</div>
	{:else}
		<div class="calendar-list">
			{#each [...groupedEvents().entries()] as [dateKey, dayEvents]}
				<div class="date-group">
					<div class="date-header">{dateKey}</div>
					{#each dayEvents as event (event.id)}
						<div class="calendar-item" class:past={isEventPast(event)}>
							<div class="calendar-left">
								<div class="calendar-importance">
									<span class="importance-dot {importanceDots[event.importance]}"></span>
								</div>
								<div class="calendar-time">{event.time}</div>
							</div>
							<div class="calendar-right">
								<div class="calendar-name">{event.name}</div>
								{#if event.forecast || event.previous || event.actual}
									<div class="calendar-values">
										{#if event.actual}
											<span class="calendar-actual">A: {event.actual}</span>
										{/if}
										{#if event.forecast}
											<span class="calendar-forecast">F: {event.forecast}</span>
										{/if}
										{#if event.previous}
											<span class="calendar-previous">P: {event.previous}</span>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.calendar-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.date-group {
		background: rgba(255, 255, 255, 0.02);
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.date-header {
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--text-muted);
		padding: 0.375rem 0.5rem;
		background: rgba(255, 255, 255, 0.03);
		border-bottom: 1px solid var(--border);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.calendar-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.calendar-item:last-child {
		border-bottom: none;
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

	.calendar-time {
		font-size: 0.6rem;
		color: var(--text-muted);
		min-width: 55px;
	}

	.calendar-right {
		flex: 1;
		min-width: 0;
	}

	.calendar-name {
		font-size: 0.7rem;
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

	.empty-state {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.7rem;
		padding: 1rem;
	}
</style>

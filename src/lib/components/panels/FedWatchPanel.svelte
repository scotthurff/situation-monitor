<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import { fetchFedWatchData } from '$lib/api/fed';
	import type { FedFundsData, BalanceSheetData, FOMCMeeting } from '$lib/api/fed';

	let fedFunds = $state<FedFundsData | null>(null);
	let balanceSheet = $state<BalanceSheetData | null>(null);
	let upcomingMeetings = $state<FOMCMeeting[]>([]);
	let recentMeetings = $state<FOMCMeeting[]>([]);

	let isLoading = $state(true);
	let error = $state<string | null>(null);

	function formatTrillion(value: number): string {
		return '$' + value.toFixed(2) + 'T';
	}

	function formatBillion(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return sign + '$' + Math.abs(value).toFixed(1) + 'B';
	}

	function formatRate(rate: number): string {
		return rate.toFixed(2) + '%';
	}

	function getDecisionClass(decision: string | undefined): string {
		if (decision === 'cut') return 'decision-cut';
		if (decision === 'hike') return 'decision-hike';
		return 'decision-hold';
	}

	function getDecisionText(meeting: FOMCMeeting): string {
		if (!meeting.decision) return '';
		if (meeting.decision === 'cut') return `Cut ${Math.abs(meeting.rateChange || 0) * 100}bp`;
		if (meeting.decision === 'hike') return `Hike ${Math.abs(meeting.rateChange || 0) * 100}bp`;
		return 'Hold';
	}

	async function loadData() {
		isLoading = true;
		error = null;
		try {
			const data = await fetchFedWatchData();
			fedFunds = data.fedFunds;
			balanceSheet = data.balanceSheet;
			upcomingMeetings = data.meetings.upcoming;
			recentMeetings = data.meetings.recent;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load Fed data';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadData();
	});
</script>

<Panel title="Fed Watch" icon="🏦" loading={isLoading} {error}>
	{#if fedFunds}
		<!-- Current Rate -->
		<div class="rate-section">
			<div class="rate-current">
				<div class="rate-label">Fed Funds Target</div>
				<div class="rate-value">
					{formatRate(fedFunds.targetLower)} - {formatRate(fedFunds.targetUpper)}
				</div>
			</div>
			<div class="rate-effective">
				<div class="rate-label">Effective Rate</div>
				<div class="rate-value">{formatRate(fedFunds.effectiveRate)}</div>
			</div>
		</div>
	{/if}

	{#if balanceSheet}
		<!-- Balance Sheet -->
		<div class="balance-section mt-3 pt-3 border-t border-border">
			<div class="text-xs text-muted mb-2">Fed Balance Sheet</div>
			<div class="balance-grid">
				<div class="balance-item">
					<div class="balance-label">Total Assets</div>
					<div class="balance-value">{formatTrillion(balanceSheet.totalAssets)}</div>
					<div class="balance-change" class:negative={balanceSheet.weeklyChange < 0}>
						{formatBillion(balanceSheet.weeklyChange)}/wk
					</div>
				</div>
				<div class="balance-item">
					<div class="balance-label">Treasuries</div>
					<div class="balance-value">{formatTrillion(balanceSheet.treasuries)}</div>
				</div>
				<div class="balance-item">
					<div class="balance-label">MBS</div>
					<div class="balance-value">{formatTrillion(balanceSheet.mbs)}</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Upcoming Meetings -->
	{#if upcomingMeetings.length > 0}
		<div class="meetings-section mt-3 pt-3 border-t border-border">
			<div class="text-xs text-muted mb-2">Upcoming FOMC Meetings</div>
			<div class="meetings-list">
				{#each upcomingMeetings as meeting}
					<div class="meeting-item">
						<span class="meeting-date">{meeting.date}</span>
						{#if meeting.hasProjections}
							<span class="meeting-projections">+ SEP</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Recent Decisions -->
	{#if recentMeetings.length > 0}
		<div class="recent-section mt-3 pt-3 border-t border-border">
			<div class="text-xs text-muted mb-2">Recent Decisions</div>
			<div class="meetings-list">
				{#each recentMeetings as meeting}
					<div class="meeting-item recent">
						<span class="meeting-date">{meeting.date}</span>
						<span class="meeting-decision {getDecisionClass(meeting.decision)}">
							{getDecisionText(meeting)}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</Panel>

<style>
	.rate-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.rate-current,
	.rate-effective {
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 0.25rem;
		text-align: center;
	}

	.rate-label {
		font-size: 0.65rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.rate-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
		white-space: nowrap;
	}

	.balance-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.balance-item {
		text-align: center;
	}

	.balance-label {
		font-size: 0.6rem;
		color: var(--text-muted);
	}

	.balance-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
	}

	.balance-change {
		font-size: 0.6rem;
		color: #2ed573;
		font-family: 'JetBrains Mono', monospace;
	}

	.balance-change.negative {
		color: #ff4757;
	}

	.meetings-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.meeting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 0.25rem;
		font-size: 0.75rem;
	}

	.meeting-item.recent {
		background: transparent;
		border-bottom: 1px solid var(--border);
		border-radius: 0;
		padding: 0.25rem 0;
	}

	.meeting-item.recent:last-child {
		border-bottom: none;
	}

	.meeting-date {
		color: var(--text-primary);
	}

	.meeting-projections {
		font-size: 0.6rem;
		padding: 0.125rem 0.25rem;
		background: rgba(68, 136, 255, 0.2);
		color: var(--blue);
		border-radius: 0.125rem;
	}

	.meeting-decision {
		font-size: 0.6rem;
		padding: 0.125rem 0.35rem;
		border-radius: 0.125rem;
		font-weight: 600;
	}

	.decision-cut {
		background: rgba(46, 213, 115, 0.2);
		color: #2ed573;
	}

	.decision-hike {
		background: rgba(255, 71, 87, 0.2);
		color: #ff4757;
	}

	.decision-hold {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-muted);
	}
</style>

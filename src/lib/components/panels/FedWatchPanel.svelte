<script lang="ts">
	import { Panel } from '$lib/components/common';

	interface FOMCMeeting {
		date: string;
		type: 'scheduled' | 'concluded';
		decision?: 'hike' | 'cut' | 'hold';
		rateChange?: number;
		newRate?: number;
		hasProjections: boolean;
	}

	interface BalanceSheetData {
		date: string;
		totalAssets: number;
		weeklyChange: number;
		treasuries: number;
		mbs: number;
	}

	// Mock data
	let fedFundsRate = $state(5.33);
	let fedFundsTarget = $state({ lower: 5.25, upper: 5.50 });

	let balanceSheet = $state<BalanceSheetData>({
		date: 'Jan 15, 2025',
		totalAssets: 6.89,
		weeklyChange: -28.5,
		treasuries: 4.31,
		mbs: 2.24
	});

	let upcomingMeetings = $state<FOMCMeeting[]>([
		{ date: 'Jan 28-29, 2025', type: 'scheduled', hasProjections: false },
		{ date: 'Mar 18-19, 2025', type: 'scheduled', hasProjections: true },
		{ date: 'May 6-7, 2025', type: 'scheduled', hasProjections: false },
		{ date: 'Jun 17-18, 2025', type: 'scheduled', hasProjections: true }
	]);

	let recentMeetings = $state<FOMCMeeting[]>([
		{ date: 'Dec 17-18, 2024', type: 'concluded', decision: 'cut', rateChange: -0.25, newRate: 4.375, hasProjections: true },
		{ date: 'Nov 6-7, 2024', type: 'concluded', decision: 'cut', rateChange: -0.25, newRate: 4.625, hasProjections: false },
		{ date: 'Sep 17-18, 2024', type: 'concluded', decision: 'cut', rateChange: -0.50, newRate: 4.875, hasProjections: true }
	]);

	// Market expectations (mock Fed Funds futures implied probabilities)
	let marketExpectations = $state({
		nextMeeting: { hold: 97, cut25: 3, cut50: 0 },
		yearEnd: { rateExpected: 4.00, cutsExpected: 2 }
	});

	let isLoading = $state(false);
	let error = $state<string | null>(null);

	function formatTrillion(value: number): string {
		return '$' + value.toFixed(2) + 'T';
	}

	function formatBillion(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return sign + '$' + Math.abs(value).toFixed(1) + 'B';
	}
</script>

<Panel title="Fed Watch" icon="🏦" loading={isLoading} {error}>
	<!-- Current Rate -->
	<div class="rate-section">
		<div class="rate-current">
			<div class="rate-label">Fed Funds Target</div>
			<div class="rate-value">{fedFundsTarget.lower.toFixed(2)}% - {fedFundsTarget.upper.toFixed(2)}%</div>
		</div>
		<div class="rate-effective">
			<div class="rate-label">Effective Rate</div>
			<div class="rate-value">{fedFundsRate.toFixed(2)}%</div>
		</div>
	</div>

	<!-- Market Expectations -->
	<div class="expectations-section mt-3 pt-3 border-t border-border">
		<div class="text-xs text-muted mb-2">Market Expectations (Next Meeting)</div>
		<div class="expectations-bar">
			<div class="expectation hold" style="width: {marketExpectations.nextMeeting.hold}%">
				{marketExpectations.nextMeeting.hold}% Hold
			</div>
			{#if marketExpectations.nextMeeting.cut25 > 0}
				<div class="expectation cut" style="width: {marketExpectations.nextMeeting.cut25}%">
					{marketExpectations.nextMeeting.cut25}% Cut
				</div>
			{/if}
		</div>
	</div>

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

	<!-- Upcoming Meetings -->
	<div class="meetings-section mt-3 pt-3 border-t border-border">
		<div class="text-xs text-muted mb-2">Upcoming FOMC Meetings</div>
		<div class="meetings-list">
			{#each upcomingMeetings.slice(0, 3) as meeting}
				<div class="meeting-item">
					<span class="meeting-date">{meeting.date}</span>
					{#if meeting.hasProjections}
						<span class="meeting-projections">+ SEP</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
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
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
		font-family: 'JetBrains Mono', monospace;
	}

	.expectations-bar {
		display: flex;
		height: 24px;
		border-radius: 0.25rem;
		overflow: hidden;
	}

	.expectation {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6rem;
		font-weight: 600;
	}

	.expectation.hold {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-secondary);
	}

	.expectation.cut {
		background: #2ed573;
		color: #000;
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

	.meeting-date {
		color: var(--text-primary);
	}

	.meeting-projections {
		font-size: 0.6rem;
		padding: 0.125rem 0.25rem;
		background: var(--accent)/20;
		color: var(--accent);
		border-radius: 0.125rem;
	}
</style>

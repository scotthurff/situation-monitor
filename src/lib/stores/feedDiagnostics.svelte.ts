/**
 * Feed Diagnostics Store
 * Tracks which feeds succeed/fail for debugging
 */

interface FeedResult {
	name: string;
	url: string;
	status: 'success' | 'failed' | 'pending';
	error?: string;
	itemCount?: number;
	duration?: number;
	timestamp: Date;
}

interface DiagnosticsState {
	results: Map<string, FeedResult>;
	isRunning: boolean;
	startTime: Date | null;
}

function createFeedDiagnosticsStore() {
	let results = $state<Map<string, FeedResult>>(new Map());
	let isRunning = $state(false);
	let startTime = $state<Date | null>(null);

	return {
		get results() {
			return results;
		},
		get isRunning() {
			return isRunning;
		},
		get startTime() {
			return startTime;
		},

		// Computed stats
		get summary() {
			const all = Array.from(results.values());
			const succeeded = all.filter((r) => r.status === 'success');
			const failed = all.filter((r) => r.status === 'failed');
			const pending = all.filter((r) => r.status === 'pending');
			const totalItems = succeeded.reduce((sum, r) => sum + (r.itemCount || 0), 0);

			return {
				total: all.length,
				succeeded: succeeded.length,
				failed: failed.length,
				pending: pending.length,
				totalItems,
				successRate: all.length > 0 ? Math.round((succeeded.length / all.length) * 100) : 0
			};
		},

		get failedFeeds() {
			return Array.from(results.values())
				.filter((r) => r.status === 'failed')
				.sort((a, b) => a.name.localeCompare(b.name));
		},

		get succeededFeeds() {
			return Array.from(results.values())
				.filter((r) => r.status === 'success')
				.sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0));
		},

		start() {
			results = new Map();
			isRunning = true;
			startTime = new Date();
		},

		recordPending(name: string, url: string) {
			results.set(url, {
				name,
				url,
				status: 'pending',
				timestamp: new Date()
			});
			// Trigger reactivity
			results = new Map(results);
		},

		recordSuccess(name: string, url: string, itemCount: number, duration: number) {
			results.set(url, {
				name,
				url,
				status: 'success',
				itemCount,
				duration,
				timestamp: new Date()
			});
			results = new Map(results);
		},

		recordFailure(name: string, url: string, error: string, duration: number) {
			results.set(url, {
				name,
				url,
				status: 'failed',
				error,
				duration,
				timestamp: new Date()
			});
			results = new Map(results);
		},

		finish() {
			isRunning = false;
		},

		clear() {
			results = new Map();
			isRunning = false;
			startTime = null;
		},

		// Export as JSON for comparison
		toJSON() {
			return {
				timestamp: startTime?.toISOString(),
				summary: this.summary,
				failed: this.failedFeeds.map((f) => ({
					name: f.name,
					url: f.url,
					error: f.error
				})),
				succeeded: this.succeededFeeds.map((f) => ({
					name: f.name,
					url: f.url,
					itemCount: f.itemCount
				}))
			};
		}
	};
}

export const feedDiagnosticsStore = createFeedDiagnosticsStore();

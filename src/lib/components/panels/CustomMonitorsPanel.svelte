<script lang="ts">
	import { browser } from '$app/environment';
	import { Panel, NewsItem } from '$lib/components/common';
	import { newsStore } from '$lib/stores';
	import type { NewsItem as NewsItemType } from '$lib/types';

	const STORAGE_KEY = 'situation-monitor-custom-monitors';

	interface CustomMonitor {
		id: string;
		name: string;
		keywords: string[];
		createdAt: Date;
	}

	// State
	let monitors = $state<CustomMonitor[]>(loadMonitors());
	let showCreateModal = $state(false);
	let newMonitorName = $state('');
	let newMonitorKeywords = $state('');
	let expandedMonitorId = $state<string | null>(null);

	/**
	 * Load monitors from localStorage
	 */
	function loadMonitors(): CustomMonitor[] {
		if (!browser) return [];
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				return parsed.map((m: CustomMonitor) => ({
					...m,
					createdAt: new Date(m.createdAt)
				}));
			}
		} catch (err) {
			console.error('[CustomMonitors] Failed to load:', err);
		}
		return [];
	}

	/**
	 * Save monitors to localStorage
	 */
	function saveMonitors(): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(monitors));
		} catch (err) {
			console.error('[CustomMonitors] Failed to save:', err);
		}
	}

	/**
	 * Create a new monitor
	 */
	function createMonitor(): void {
		if (!newMonitorName.trim() || !newMonitorKeywords.trim()) return;

		const keywords = newMonitorKeywords
			.split(',')
			.map((k) => k.trim().toLowerCase())
			.filter((k) => k.length > 0);

		if (keywords.length === 0) return;

		const newMonitor: CustomMonitor = {
			id: `custom-${Date.now()}`,
			name: newMonitorName.trim(),
			keywords,
			createdAt: new Date()
		};

		monitors = [...monitors, newMonitor];
		saveMonitors();

		// Reset form
		newMonitorName = '';
		newMonitorKeywords = '';
		showCreateModal = false;
	}

	/**
	 * Delete a monitor
	 */
	function deleteMonitor(id: string): void {
		monitors = monitors.filter((m) => m.id !== id);
		saveMonitors();
		if (expandedMonitorId === id) {
			expandedMonitorId = null;
		}
	}

	/**
	 * Get matching news count for a monitor
	 */
	function getMatchCount(keywords: string[]): number {
		return newsStore.news.filter((item) => {
			const text = `${item.title} ${item.description || ''}`.toLowerCase();
			return keywords.some((kw) => text.includes(kw));
		}).length;
	}

	/**
	 * Get matching news items for a monitor
	 */
	function getMatchingItems(keywords: string[]): NewsItemType[] {
		return newsStore.news
			.filter((item) => {
				const text = `${item.title} ${item.description || ''}`.toLowerCase();
				return keywords.some((kw) => text.includes(kw));
			})
			.slice(0, 10);
	}

	/**
	 * Toggle expanded monitor
	 */
	function toggleExpanded(id: string): void {
		expandedMonitorId = expandedMonitorId === id ? null : id;
	}

	/**
	 * Add monitor from suggested keywords (for emerging patterns)
	 */
	export function addMonitorFromKeywords(name: string, keywords: string[]): void {
		const newMonitor: CustomMonitor = {
			id: `custom-${Date.now()}`,
			name,
			keywords,
			createdAt: new Date()
		};
		monitors = [...monitors, newMonitor];
		saveMonitors();
	}
</script>

<Panel
	id="custom-monitors"
	title="Custom Monitors"
	icon="👁️"
	count={monitors.length}
	loading={newsStore.isLoading}
>
	{#snippet header()}
		<button class="create-btn" onclick={() => (showCreateModal = true)}>
			+ Create Monitor
		</button>
	{/snippet}

	{#if monitors.length === 0 && !showCreateModal}
		<div class="empty-state">
			<p>No custom monitors yet</p>
			<p class="hint">Create monitors to track specific topics or keywords</p>
		</div>
	{:else}
		<div class="monitors-list">
			{#each monitors as monitor (monitor.id)}
				{@const matchCount = getMatchCount(monitor.keywords)}
				<div class="monitor-item">
					<div class="monitor-header-row">
						<button
							class="monitor-header"
							onclick={() => toggleExpanded(monitor.id)}
						>
							<div class="monitor-info">
								<span class="monitor-name">{monitor.name}</span>
								<span class="monitor-keywords-preview">
									{monitor.keywords.slice(0, 3).join(', ')}
									{#if monitor.keywords.length > 3}
										+{monitor.keywords.length - 3}
									{/if}
								</span>
							</div>
							<span class="match-count" class:has-matches={matchCount > 0}>
								{matchCount}
							</span>
						</button>
						<button
							class="delete-btn"
							onclick={() => deleteMonitor(monitor.id)}
							title="Delete monitor"
						>
							×
						</button>
					</div>

					{#if expandedMonitorId === monitor.id}
						<div class="monitor-expanded">
							{#if matchCount === 0}
								<div class="no-matches">No matching news</div>
							{:else}
								{#each getMatchingItems(monitor.keywords) as item (item.id)}
									<NewsItem {item} />
								{/each}
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	{#if showCreateModal}
		<div class="create-modal">
			<div class="modal-header">
				<span>New Monitor</span>
				<button class="close-btn" onclick={() => (showCreateModal = false)}>×</button>
			</div>
			<div class="modal-body">
				<label class="input-label">
					Name
					<input
						type="text"
						bind:value={newMonitorName}
						placeholder="e.g., Trade War"
						class="input-field"
					/>
				</label>
				<label class="input-label">
					Keywords (comma-separated)
					<input
						type="text"
						bind:value={newMonitorKeywords}
						placeholder="e.g., tariff, trade, import, export"
						class="input-field"
					/>
				</label>
				<button
					class="submit-btn"
					onclick={createMonitor}
					disabled={!newMonitorName.trim() || !newMonitorKeywords.trim()}
				>
					Create Monitor
				</button>
			</div>
		</div>
	{/if}
</Panel>

<style>
	.create-btn {
		font-size: 0.65rem;
		padding: 0.25rem 0.5rem;
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-weight: 500;
	}

	.create-btn:hover {
		opacity: 0.9;
	}

	.empty-state {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.7rem;
		padding: 1rem;
	}

	.empty-state .hint {
		font-size: 0.6rem;
		margin-top: 0.5rem;
		opacity: 0.7;
	}

	.monitors-list {
		display: flex;
		flex-direction: column;
	}

	.monitor-item {
		border-bottom: 1px solid var(--border);
	}

	.monitor-item:last-child {
		border-bottom: none;
	}

	.monitor-header-row {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.monitor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex: 1;
		padding: 0.5rem 0;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
	}

	.monitor-header:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.monitor-info {
		flex: 1;
		min-width: 0;
	}

	.monitor-name {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text);
		display: block;
	}

	.monitor-keywords-preview {
		font-size: 0.55rem;
		color: var(--text-muted);
		margin-top: 0.1rem;
		display: block;
	}

	.match-count {
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--text-muted);
		background: var(--border);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.match-count.has-matches {
		color: var(--green);
		background: rgba(0, 255, 100, 0.1);
	}

	.delete-btn {
		font-size: 0.8rem;
		color: var(--text-muted);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.125rem 0.25rem;
		line-height: 1;
	}

	.delete-btn:hover {
		color: var(--red);
	}

	.monitor-expanded {
		padding: 0.5rem 0;
		border-top: 1px solid var(--border);
	}

	.no-matches {
		font-size: 0.65rem;
		color: var(--text-muted);
		text-align: center;
		padding: 0.5rem;
	}

	.create-modal {
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.25rem;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text);
		margin-bottom: 0.75rem;
	}

	.close-btn {
		font-size: 1rem;
		color: var(--text-muted);
		background: none;
		border: none;
		cursor: pointer;
		line-height: 1;
	}

	.close-btn:hover {
		color: var(--text);
	}

	.modal-body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-label {
		font-size: 0.6rem;
		color: var(--text-muted);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.input-field {
		font-size: 0.7rem;
		padding: 0.375rem 0.5rem;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 0.25rem;
		color: var(--text);
	}

	.input-field:focus {
		outline: none;
		border-color: var(--accent);
	}

	.submit-btn {
		font-size: 0.65rem;
		padding: 0.375rem 0.75rem;
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-weight: 500;
		margin-top: 0.25rem;
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.submit-btn:hover:not(:disabled) {
		opacity: 0.9;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/common';
	import { fetchGovContracts } from '$lib/api/government';
	import type { GovContract } from '$lib/types';

	let contracts: GovContract[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	const totalValue = $derived(contracts.reduce((sum, c) => sum + c.value, 0));

	function formatValue(v: number): string {
		if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
		if (v >= 1e6) return '$' + (v / 1e6).toFixed(0) + 'M';
		if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
		return '$' + v.toFixed(0);
	}

	function getTypeClass(type: string): string {
		switch (type) {
			case 'contract':
				return 'type-contract';
			case 'grant':
				return 'type-grant';
			case 'modification':
				return 'type-mod';
			default:
				return '';
		}
	}

	async function loadContracts() {
		loading = true;
		error = null;
		try {
			contracts = await fetchGovContracts();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load contracts';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadContracts();
	});
</script>

<Panel id="gov-contracts" title="Gov Contracts" icon="🏛️" count={contracts.length} {loading} {error}>
	{#snippet header()}
		{#if totalValue > 0}
			<div class="total-value">Total: {formatValue(totalValue)}</div>
		{/if}
	{/snippet}

	{#if contracts.length === 0 && !loading && !error}
		<div class="empty-state">No contracts available</div>
	{:else}
		<div class="contracts-list">
			{#each contracts as contract (contract.id)}
				{#if contract.link}
					<a href={contract.link} target="_blank" rel="noopener noreferrer" class="contract-item contract-link">
						<div class="contract-header">
							<span class="contract-agency">{contract.agency}</span>
							<span class="contract-type {getTypeClass(contract.type)}">{contract.type}</span>
						</div>
						<div class="contract-vendor">{contract.vendor}</div>
						<div class="contract-desc">{contract.description}</div>
						<div class="contract-value">{formatValue(contract.value)}</div>
					</a>
				{:else}
					<div class="contract-item">
						<div class="contract-header">
							<span class="contract-agency">{contract.agency}</span>
							<span class="contract-type {getTypeClass(contract.type)}">{contract.type}</span>
						</div>
						<div class="contract-vendor">{contract.vendor}</div>
						<div class="contract-desc">{contract.description}</div>
						<div class="contract-value">{formatValue(contract.value)}</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</Panel>

<style>
	.total-value {
		font-size: 0.65rem;
		color: var(--green);
		font-weight: 600;
	}

	.contracts-list {
		display: flex;
		flex-direction: column;
	}

	.contract-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.contract-item:last-child {
		border-bottom: none;
	}

	.contract-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.contract-agency {
		font-size: 0.6rem;
		font-weight: 600;
		color: var(--blue);
	}

	.contract-type {
		font-size: 0.5rem;
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		text-transform: uppercase;
	}

	.type-contract {
		background: rgba(68, 255, 136, 0.15);
		color: var(--green);
	}

	.type-grant {
		background: rgba(68, 136, 255, 0.15);
		color: var(--blue);
	}

	.type-mod {
		background: rgba(255, 170, 0, 0.15);
		color: var(--yellow);
	}

	.contract-vendor {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text);
	}

	.contract-desc {
		font-size: 0.6rem;
		color: var(--text-dim);
		margin-top: 0.15rem;
		line-height: 1.3;
	}

	.contract-value {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--green);
		margin-top: 0.25rem;
	}

	.empty-state {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.7rem;
		padding: 1rem;
	}

	.contract-link {
		display: block;
		text-decoration: none;
		color: inherit;
		transition: background 0.15s;
	}

	.contract-link:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.contract-link:hover .contract-vendor {
		color: var(--accent);
	}
</style>

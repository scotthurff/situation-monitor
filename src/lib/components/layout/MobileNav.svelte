<script lang="ts">
	import { mobileNavStore, type MobileTab } from '$lib/stores/mobileNav.svelte';

	function handleTabClick(tabId: MobileTab) {
		mobileNavStore.setTab(tabId);
	}
</script>

<nav class="mobile-nav">
	{#each mobileNavStore.tabs as tab (tab.id)}
		<button
			class="nav-tab"
			class:active={mobileNavStore.activeTab === tab.id}
			onclick={() => handleTabClick(tab.id)}
			aria-label={tab.label}
			aria-current={mobileNavStore.activeTab === tab.id ? 'page' : undefined}
		>
			<span class="tab-icon">{tab.icon}</span>
			<span class="tab-label">{tab.label}</span>
		</button>
	{/each}
</nav>

<style>
	.mobile-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 60px;
		padding-bottom: env(safe-area-inset-bottom, 0);
		background: var(--surface);
		border-top: 1px solid var(--border);
		display: flex;
		justify-content: space-around;
		align-items: center;
		z-index: 100;
	}

	.nav-tab {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		min-height: 44px;
		min-width: 44px;
		padding: 0.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--text-muted);
		transition: color 0.15s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.nav-tab:active {
		background: var(--surface-hover);
	}

	.nav-tab.active {
		color: var(--text);
	}

	.nav-tab.active .tab-icon {
		transform: scale(1.1);
	}

	.tab-icon {
		font-size: 1.25rem;
		line-height: 1;
		transition: transform 0.15s ease;
	}

	.tab-label {
		font-size: 0.65rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}
</style>

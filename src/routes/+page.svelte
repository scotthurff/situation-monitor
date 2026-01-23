<script lang="ts">
	import { Dashboard } from '$lib/components/layout';
	import { newsStore, marketsStore } from '$lib/stores';

	// Receive server-side loaded data
	let { data } = $props();

	// Hydrate stores with server data immediately (runs before mount)
	$effect.pre(() => {
		if (data?.initialNews?.length) {
			newsStore.hydrate(data.initialNews);
		}
		if (data?.initialIndices?.length) {
			marketsStore.hydrateIndices(data.initialIndices);
		}
	});
</script>

<svelte:head>
	<title>Situation Monitor - Real-time Global Intelligence</title>
</svelte:head>

<Dashboard />

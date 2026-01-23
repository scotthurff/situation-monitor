<script lang="ts">
	import { MobileView } from '$lib/components/layout';
	import { MapPanel } from '$lib/components/panels';
</script>

<MobileView noPadding>
	<div class="map-wrapper">
		<MapPanel />
	</div>
</MobileView>

<style>
	.map-wrapper {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.map-wrapper :global(.panel) {
		flex: 1;
		display: flex;
		flex-direction: column;
		border-radius: 0;
		border: none;
	}

	.map-wrapper :global(.panel-content) {
		flex: 1;
		padding: 0;
	}

	.map-wrapper :global(.map-container) {
		aspect-ratio: unset;
		height: 100%;
	}
</style>

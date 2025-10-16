<script lang="ts">
	import Mushaf from '$lib/mushaf/Mushaf.svelte';
	import Navigation from '$lib/navigation/Navigation.svelte';
	import QuickNavigation from '$lib/navigation/QuickNavigation.svelte';

	let pageNumber = 1;
	let qpcVersion: '1' | '2' = '2';
	let isNavigationOpened = false;
</script>

<div class="flex flex-row w-full h-full relative">
	<Navigation bind:pageNumber />

	<div class="flex flex-col flex-1 h-full">
		<div class="flex-1 overflow-hidden">
			<Mushaf {pageNumber} {qpcVersion} />
		</div>
		<QuickNavigation bind:pageNumber />
	</div>
</div>

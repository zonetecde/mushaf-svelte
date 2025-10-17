<script lang="ts">
	import Mushaf from '$lib/mushaf/Mushaf.svelte';
	import Navigation from '$lib/navigation/Navigation.svelte';
	import QuickNavigation from '$lib/navigation/QuickNavigation.svelte';
	import QuickSettings from '$lib/settings/QuickSettings.svelte';

	let pageNumber = 1;
	let qpcVersion: '1' | '2' = '2';
	let isNavigationOpened = false;
	let doublePage = true;
</script>

<div class="flex flex-row w-full h-full relative">
	<Navigation bind:pageNumber {doublePage} />

	<div class="flex flex-col flex-1 h-full">
		<div class="flex-1 overflow-hidden">
			<Mushaf {pageNumber} {qpcVersion} {doublePage} />
		</div>
		<QuickNavigation bind:pageNumber {doublePage} />
		<QuickSettings bind:doublePage />
	</div>
</div>

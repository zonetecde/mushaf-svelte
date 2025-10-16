<script lang="ts">
	import Mushaf from '$lib/mushaf/Mushaf.svelte';
	import Navigation from '$lib/navigation/Navigation.svelte';

	let pageNumber = 1;
	let qpcVersion: '1' | '2' = '2';
	let isNavigationOpened = false;
</script>

<div class="flex flex-row w-full h-full relative">
	<Navigation bind:pageNumber />

	<Mushaf {pageNumber} {qpcVersion} />
</div>

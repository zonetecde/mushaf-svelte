<script lang="ts">
	import Page from '$lib/mushaf/Page.svelte';

	let {
		pageNumber,
		qpcVersion
	}: {
		pageNumber: number; // 1-604
		qpcVersion: '1' | '2'; // 1 or 2
	} = $props();
</script>

<div class="flex w-full h-full">
	<Page pageNumber={pageNumber + 1} {qpcVersion} alignment="end" />
	<Page {pageNumber} {qpcVersion} alignment="start" />
</div>

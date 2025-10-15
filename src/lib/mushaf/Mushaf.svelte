<script lang="ts">
	import Page from '$lib/mushaf/Page.svelte';

	let pageNumber = 2;
	let qpcVersion: '1' | '2' = '2';
</script>

<div class="flex w-full h-full">
	<Page {pageNumber} {qpcVersion} alignment="end" />
	<Page pageNumber={pageNumber + 1} {qpcVersion} alignment="start" />
</div>

<script lang="ts">
	import Page from '$lib/mushaf/Page.svelte';

	let {
		pageNumber,
		qpcVersion,
		doublePage
	}: {
		pageNumber: number; // 1-604
		qpcVersion: '1' | '2'; // 1 or 2
		doublePage: boolean;
	} = $props();

	$effect(() => {
		// Quand on remet en mode double page, s'assurer que la page est impaire
		if (doublePage && pageNumber % 2 === 0) {
			pageNumber = pageNumber - 1;
		}
	});
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-6 md:flex-row md:items-stretch md:gap-8">
	{#if doublePage}
		<Page pageNumber={pageNumber + 1} {qpcVersion} alignment="end" />
	{/if}
	<Page {pageNumber} {qpcVersion} alignment={doublePage ? 'start' : 'center'} />
</div>

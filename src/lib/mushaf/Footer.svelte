<script lang="ts">
	import ArabicService from '$lib/services/arabic';

	let {
		pageNumber,
		pageSurah
	}: {
		pageNumber: number;
		pageSurah: number | null;
	} = $props();
</script>

<div class="absolute bottom-2 left-0 right-0">
	<div class="flex justify-between text-sm text-gray-800 px-2">
		<div>Page {pageNumber}</div>
		<div class="text-black scale-200">
			{ArabicService.latinToArabicNumbers(pageNumber)}
		</div>
		<div>Sourate {pageSurah ?? '?'}</div>
	</div>
</div>

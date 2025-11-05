<script lang="ts">
	let {
		pageNumber = $bindable(),
		doublePage
	}: {
		pageNumber: number;
		doublePage: boolean;
	} = $props();
</script>

<div
	class="fixed bottom-0 left-0 right-0 z-40 flex w-full flex-shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3 shadow-lg md:relative md:bottom-auto md:left-auto md:right-auto md:h-12 md:justify-center md:border-t md:border-gray-300 md:bg-transparent md:px-0 md:py-0 md:shadow-none"
>
	<button
		class="flex w-32 items-center justify-center rounded-full bg-gray-200 px-4 py-2 font-medium transition-colors duration-150 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 md:m-2 md:w-24"
		disabled={pageNumber >= (doublePage ? 603 : 604)}
		onclick={() => {
			pageNumber = Math.min(doublePage ? 603 : 604, pageNumber + (doublePage ? 2 : 1));
		}}
	>
		Suivant
	</button>
	<button
		class="flex w-32 items-center justify-center rounded-full bg-gray-200 px-4 py-2 font-medium transition-colors duration-150 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 md:m-2 md:w-24"
		disabled={pageNumber <= 1}
		onclick={() => {
			pageNumber = Math.max(1, pageNumber - (doublePage ? 2 : 1));
		}}
	>
		Precedent
	</button>
</div>

<script lang="ts">
	let {
		pageNumber = $bindable(),
		doublePage
	}: {
		pageNumber: number;
		doublePage: boolean;
	} = $props();
</script>

<div class="w-full h-12 flex-shrink-0 justify-center flex border-t border-gray-300">
	<button
		class="m-2 p-2 bg-gray-200 rounded cursor-pointer disabled:opacity-50 items-center flex w-24 justify-center"
		disabled={pageNumber >= (doublePage ? 603 : 604)}
		onclick={() => {
			pageNumber = Math.min(doublePage ? 603 : 604, pageNumber + (doublePage ? 2 : 1));
		}}
	>
		Suivant</button
	>
	<button
		class="m-2 p-2 bg-gray-200 rounded cursor-pointer disabled:opacity-50 flex items-center w-24 justify-center"
		disabled={pageNumber <= 1}
		onclick={() => {
			pageNumber = Math.max(1, pageNumber - (doublePage ? 2 : 1));
		}}>Précédent</button
	>
</div>

<script lang="ts">
	let {
		pageNumber = $bindable()
	}: {
		pageNumber: number;
	} = $props();
</script>

<div class="w-full h-12 flex-shrink-0 justify-center flex border-t border-gray-300">
	<button
		class="m-2 p-2 bg-gray-200 rounded cursor-pointer disabled:opacity-50 items-center flex w-24 justify-center"
		disabled={pageNumber >= 603}
		onclick={() => {
			pageNumber = Math.min(603, pageNumber + 2);
		}}
	>
		Suivant</button
	>
	<button
		class="m-2 p-2 bg-gray-200 rounded cursor-pointer disabled:opacity-50 flex items-center w-24 justify-center"
		disabled={pageNumber <= 1}
		onclick={() => {
			pageNumber = Math.max(1, pageNumber - 2);
		}}>Précédent</button
	>
</div>

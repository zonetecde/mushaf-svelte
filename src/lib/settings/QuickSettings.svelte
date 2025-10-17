<script lang="ts">
	let {
		doublePage = $bindable()
	}: {
		doublePage: boolean;
	} = $props();
</script>

<div class="absolute bottom-3 right-0 opacity-40 hover:opacity-100 duration-100">
	<label class="flex items-center justify-center h-full mx-4 cursor-pointer select-none">
		<input type="checkbox" class="mr-2 w-5 h-5 cursor-pointer" bind:checked={doublePage} />
		Double page
	</label>
</div>

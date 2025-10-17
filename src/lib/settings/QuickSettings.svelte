<script lang="ts">
	let {
		doublePage = $bindable(),
		qpcVersion = $bindable()
	}: {
		doublePage: boolean;
		qpcVersion: '1' | '2';
	} = $props();
</script>

<div class="absolute bottom-0 right-0 opacity-40 hover:opacity-100 duration-100 text-xs">
	<label class="flex items-center h-full mx-4 cursor-pointer select-none">
		<input type="checkbox" class="mr-2 w-5 h-5 cursor-pointer" bind:checked={doublePage} />
		Double page
	</label>

	<label class="flex items-center h-full mx-4 cursor-pointer select-none">
		<span class="mr-2">Version QPC:</span>
		<select class="cursor-pointer p-1 border border-gray-300 rounded" bind:value={qpcVersion}>
			<option value="1">1</option>
			<option value="2">2</option>
		</select>
	</label>
</div>

<script lang="ts">
	let {
		doublePage = $bindable(),
		qpcVersion = $bindable(),
		isMobile = false
	}: {
		doublePage: boolean;
		qpcVersion: '1' | '2';
		isMobile?: boolean;
	} = $props();

	$effect(() => {
		if (isMobile && doublePage) {
			doublePage = false;
		}
	});

	const containerClasses = $derived(
		isMobile
			? 'w-full border-t border-gray-200 bg-white px-4 pt-3 -translate-y-16 text-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center shadow-md'
			: 'absolute bottom-4 right-4 flex flex-row gap-2 items-end text-xs opacity-40 transition-opacity duration-150 hover:opacity-100 z-40 gap-x-5'
	);
</script>

<div class={containerClasses}>
	{#if !isMobile}
		<label class="flex items-center gap-2 cursor-pointer select-none opacity-90">
			<input
				type="checkbox"
				class="h-5 w-5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
				bind:checked={doublePage}
			/>
			<span> Double page </span>
		</label>
	{/if}

	<label class={'flex items-center gap-2 select-none ' + (isMobile ? 'justify-center' : '')}>
		<span>Version QPC:</span>
		<select
			class="rounded border border-gray-300 text-sm md:text-xs"
			bind:value={qpcVersion}
			aria-label="Choisir la version QPC"
		>
			<option value="1">1</option>
			<option value="2">2</option>
		</select>
	</label>
</div>

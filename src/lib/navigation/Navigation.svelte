<script lang="ts">
	import { slide } from 'svelte/transition';

	let { pageNumber = $bindable() }: { pageNumber: number } = $props();

	let isOpened = $state(true);
	let choix: 'Sourate' | 'Juz' | 'Hizb' | 'Page' = $state('Sourate');

	function handleOptionClick(page: number): any {
		if (page % 2 !== 1) page--;
		pageNumber = page;
	}

	async function getAvailableOptions(choix: string): Promise<{ id: string; page: number }[]> {
		if (choix === 'Page') {
			return Array.from({ length: 604 }, (_, i) => ({
				id: `Page ${i + 1}`,
				page: i + 1
			}));
		}

		let fileName = '';

		switch (choix) {
			case 'Juz':
				fileName = '/juz.json';
				break;
			case 'Hizb':
				fileName = '/hizb.json';
				break;
			case 'Sourate':
			default:
				fileName = '/surahs.json';
				break;
		}

		const res = await fetch(fileName);
		const data = await res.json();
		return data;
	}
</script>

<div
	class="w-1/5 z-5 h-full px-3 pt-6 overflow-hidden bg-gray-200 absolute flex flex-col left-0 top-0 bottom-0"
	transition:slide={{ axis: 'x' }}
>
	<button
		class="absolute top-2 right-2 cursor-pointer bg-gray-300 rounded-full px-1.5 pt-1.5 pb-0"
		onclick={() => (isOpened = false)}
	>
		<span class="material-icons">close</span>
	</button>

	<h2 class="text-lg font-bold mb-4 text-center">Navigation</h2>

	<div class="flex flex-row">
		{#each ['Sourate', 'Juz', 'Hizb', 'Page'] as item}
			<button
				class={'flex-1 rounded p-2 m-1 cursor-pointer ' +
					(choix === item
						? 'hover:bg-blue-100 bg-blue-100 border border-blue-300'
						: 'hover:bg-gray-100 bg-white border border-gray-300')}
				onclick={() => (choix = item as any)}
			>
				{item}
			</button>
		{/each}
	</div>

	<div class="flex flex-col overflow-y-auto overflow-x-hidden px-2">
		{#await getAvailableOptions(choix) then options}
			{#if options.length === 0}
				<p class="text-center text-gray-500 mt-4">Aucune option disponible</p>
			{:else}
				{#each options as option}
					<button
						class="w-full mx-auto rounded p-2 m-1 bg-white border border-gray-300 hover:bg-gray-100 cursor-pointer"
						onclick={() => handleOptionClick(option.page)}
					>
						{option.id}
					</button>
				{/each}
			{/if}
		{/await}
	</div>
</div>

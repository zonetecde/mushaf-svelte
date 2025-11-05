<script lang="ts">
	import { slide } from 'svelte/transition';

	let {
		pageNumber = $bindable(),
		doublePage,
		isMobile
	}: { pageNumber: number; doublePage: boolean; isMobile: boolean } = $props();

	let isOpened = $state(false);
	let choix: 'Sourate' | 'Juz' | 'Hizb' | 'Page' = $state('Sourate');

	function handleOptionClick(page: number): any {
		if (page % 2 !== 1 && doublePage) page--;
		pageNumber = page;

		if (isMobile) {
			isOpened = false;
		}
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

	let handleClickOutside: (event: MouseEvent) => void;
	$effect(() => {
		if (isOpened) {
			// Close the navigation when clicking outside
			handleClickOutside = (event: MouseEvent) => {
				const navElement = document.querySelector('#navigation');
				if (navElement && !navElement.contains(event.target as Node)) {
					isOpened = false;
				}
			};
			setTimeout(() => {
				// Delay to avoid immediate closing when opening
				document.addEventListener('click', handleClickOutside);
			}, 0);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

{#if isOpened}
	<div
		class="fixed inset-0 z-50 flex h-full w-full flex-col overflow-hidden bg-gray-200 px-4 pt-16 shadow-xl sm:px-6 sm:pt-10 md:relative md:left-0 md:top-0 md:h-full md:w-72 md:border-r md:border-gray-300 md:px-3 md:pt-6 md:shadow md:inset-auto"
		id="navigation"
		transition:slide={{ axis: 'x' }}
		role="dialog"
		aria-modal="true"
	>
		<button
			class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-xl transition-colors duration-150 hover:bg-gray-400 md:right-2 md:top-2"
			onclick={() => (isOpened = false)}
			aria-label="Fermer la navigation"
		>
			<span class="material-icons">close</span>
		</button>

		<h2 class="mb-4 mt-2 text-center text-xl font-bold md:mt-0">Navigation</h2>

		<div class="flex flex-wrap gap-2 md:flex-nowrap">
			{#each ['Sourate', 'Juz', 'Hizb', 'Page'] as item}
				<button
					class={'flex-1 rounded border p-2 text-sm transition-colors duration-150 ' +
						(choix === item
							? 'border-blue-300 bg-blue-100 hover:bg-blue-200'
							: 'border-gray-300 bg-white hover:bg-gray-100')}
					onclick={() => (choix = item as any)}
				>
					{item}
				</button>
			{/each}
		</div>

		<div class="mt-4 flex flex-col overflow-y-auto overflow-x-hidden px-1">
			{#await getAvailableOptions(choix) then options}
				{#if options.length === 0}
					<p class="text-center text-gray-500 mt-4">Aucune option disponible</p>
				{:else}
					{#each options as option}
						<button
							class="mx-auto my-1 w-full rounded border border-gray-300 bg-white p-3 text-left text-sm transition-colors duration-150 hover:bg-gray-100"
							onclick={() => handleOptionClick(option.page)}
						>
							<span>{option.id}</span>
							{#if choix !== 'Page'}
								<span class="float-right text-gray-600">{option.page}</span>
							{/if}
						</button>
					{/each}
				{/if}
			{/await}
		</div>
	</div>
{:else}
	<button
		class="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gray-300 text-2xl shadow transition-colors duration-150 hover:bg-gray-400 md:absolute md:left-0 md:top-5 md:h-12 md:w-10 md:rounded-r-2xl md:rounded-l-none md:shadow-none"
		onclick={() => (isOpened = true)}
		transition:slide={{ axis: 'x' }}
		aria-label="Ouvrir la navigation"
	>
		<span class="material-icons">menu</span>
	</button>
{/if}

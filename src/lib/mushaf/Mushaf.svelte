<script lang="ts">
	import { BasmalaLine, SurahHeaderLine, TextLine } from '$lib/classes/Line';
	import Page from '$lib/classes/Page';
	import ArabicService from '$lib/services/arabic';
	import qpcFontProvider from '$lib/services/fontProvider';
	import { onMount } from 'svelte';

	const qpcVersion: '1' | '2' = '2';
	const SURAH_HEADER_FONT = 'surahs';
	const BASMALA_FONT = qpcFontProvider.getBasmalaFont(qpcVersion);

	let pageNumber = 2; // Numéro de la page actuelle (1-604)
	let pageData = $state<Page | null>(null); // Données de la page actuelle
	let pageSurah = $state<number | null>(null); // La première sourate sur la page

	let containerRef: HTMLDivElement;
	let pageRef: HTMLDivElement;
	let scale = $state(1);

	// Ratio A4 : 210mm x 297mm = 0.707
	const A4_RATIO = 210 / 297;
	const BASE_WIDTH = 794; // Base width in pixels (A4 at 96 DPI)
	const BASE_HEIGHT = 1123; // Base height in pixels

	function updateScale() {
		if (!containerRef || !pageRef) return;

		const containerRect = containerRef.getBoundingClientRect();
		const containerWidth = containerRect.width;
		const containerHeight = containerRect.height;

		const scaleByWidth = containerWidth / BASE_WIDTH;
		const scaleByHeight = containerHeight / BASE_HEIGHT;

		const newScale = Math.min(scaleByWidth, scaleByHeight, 1);
		scale = newScale;
	}

	async function loadPageLines(pageNumber: number) {
		const key = `/mushaf/page-${String(pageNumber).padStart(3, '0')}.json`;
		const json = await (await fetch(key)).json();

		if (!json) {
			console.warn(`Mushaf lines file missing for page ${pageNumber}`);
			return;
		}

		pageData = Page.fromJSON(json);
		pageSurah = (
			pageData.lines.find((line) => line.type === 'text') as TextLine
		).words[0].getSurahNumber();
		console.log('Loaded page data:', pageData);
	}

	onMount(() => {
		// Charger les données QPC
		qpcFontProvider.loadQPC2Data();

		loadPageLines(pageNumber);

		// Observe resizing to keep the page within the viewport
		const resizeObserver = new ResizeObserver(() => {
			updateScale();
		});

		if (containerRef) {
			resizeObserver.observe(containerRef);
		}

		return () => {
			resizeObserver.disconnect();
		};
	});
</script>

<div
	bind:this={containerRef}
	class="h-full w-full flex items-center justify-center bg-gray-100 overflow-hidden"
>
	<div
		bind:this={pageRef}
		class={'bg-white shadow-xl border border-gray-300 flex flex-col px-8 py-8 overflow-hidden ' +
			(pageNumber > 2 ? 'justify-around' : 'justify-center gap-y-5')}
		style="
			width: {BASE_WIDTH}px; 
			height: {BASE_HEIGHT}px; 
			transform: scale({scale}); 
			transform-origin: center;
			aspect-ratio: {A4_RATIO};
		"
	>
		{#if pageData !== null}
			{@const allLines = pageData.lines}
			{#each Object.entries(allLines) as [lineNumber, line], index}
				{@const nextLine = allLines[index + 1]}
				{@const nextLineHasSurahHeader = nextLine && nextLine.type === 'surah-header'}
				{@const shouldJustify =
					// On ne justifie pas les deux premières pages (en forme de cercle)
					pageNumber > 2 &&
					// On ne justifie pas les lignes qui sont suivies d'une entête de sourate
					// (= dernière ligne d'une sourate)
					!nextLineHasSurahHeader &&
					// Pour toutes les dernières pages du mushaf, on centre les dernières lignes
					// qui sont la fin des petites sourates (les justifiers crée de trop grands espaces)
					(lineNumber != '14' || pageNumber <= 599)}

				<!-- Ligne du mushaf -->
				<div
					class={'flex w-full flex-row  ' + (shouldJustify ? 'justify-between' : 'justify-center')}
					dir="rtl"
					data-testid={'line-' + lineNumber}
				>
					{#if line.type === 'surah-header'}
						<div
							class={'text-6xl m-2 text-center w-full h-8  ' +
								(pageNumber > 2 ? 'relative' : 'absolute top-0')}
							style="font-family: {SURAH_HEADER_FONT}"
							dir="ltr"
						>
							<img
								src="/assets/surah-header.jpg"
								alt="Banniere"
								class="absolute inset-0 z-0 w-full object-cover"
							/>
							<span class="z-10 absolute inset-0 top-2 scale-120"
								>{(line as SurahHeaderLine).surahNumber}</span
							>
						</div>
					{:else if line.type === 'basmala'}
						<div
							class="text-3xl m-2 pt-3 text-center w-full"
							dir="ltr"
							style="font-family: {BASMALA_FONT}"
						>
							{qpcFontProvider.getBasmalaGlyph(qpcVersion)}
						</div>
					{:else if line.type === 'text'}
						{#each (line as TextLine).words as word}
							<div
								class={shouldJustify ? 'text-4xl text-nowrap' : 'text-4xl m-1 text-nowrap'}
								style="font-family: {qpcFontProvider.getFontNameForWord(word, qpcVersion)}"
							>
								{qpcVersion === '2' ? word.qpcV2 : word.qpcV1}
							</div>
						{/each}
					{/if}
				</div>
			{/each}

			<!-- Footer -->
			<div class="absolute bottom-2 left-0 right-0">
				<div class="flex justify-between text-sm text-gray-800 px-2">
					<div>Page {pageNumber}</div>
					<div class="text-black scale-200">
						{ArabicService.latinToArabicNumbers(pageNumber)}
					</div>
					<div>Sourate {pageSurah ?? '?'}</div>
				</div>
			</div>
		{/if}
	</div>
</div>

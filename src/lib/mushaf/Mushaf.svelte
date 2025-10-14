<script lang="ts">
	import ArabicService from '$lib/services/arabic';
	import QPCFontProvider from '$lib/services/font-provider';
	import { onMount } from 'svelte';

	const qpcVersion: '1' | '2' = '2';
	const SURAH_HEADER_FONT = 'surahs';
	const BASMALA_FONT = QPCFontProvider.getBasmalaFont(qpcVersion);

	let page = 602;
	let lines = $state<any[][] | null>(null);
	let pageSurah = $state<number | null>(null);
	let containerRef: HTMLDivElement;
	let pageRef: HTMLDivElement;
	let scale = $state(1);

	let hasMounted = false;

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
		const loader = await (await fetch(key)).json();

		if (!loader) {
			console.warn(`Mushaf lines file missing for page ${pageNumber}`);
			return;
		}

		try {
			const rawLines = Array.isArray(loader.lines) ? loader.lines : [];
			let detectedSurah: number | null = null;

			const hydratedLines = rawLines.map((line: any) => {
				const entries = Array.isArray(line) ? line : [];
				return entries.map((entry: any) => {
					if (entry.type === 'word' && entry.location) {
						const parts = String(entry.location).split(':');
						const surah = Number(parts[0]);
						const verse = Number(parts[1]);
						const hasValidLocation = Number.isFinite(surah) && Number.isFinite(verse);
						const fontName = hasValidLocation
							? QPCFontProvider.getFontNameForVerse(surah, verse, qpcVersion)
							: QPCFontProvider.getFontNameForVerse(1, 1, qpcVersion);
						const glyph = qpcVersion === '2' ? entry.qpcV2 : entry.qpcV1;

						if (detectedSurah === null && Number.isFinite(surah)) {
							detectedSurah = surah;
						}

						return {
							...entry,
							surah,
							verse,
							font: fontName,
							qpc: glyph ?? entry.word ?? entry.qpc ?? ''
						};
					}

					if (entry.type === 'basmala') {
						const glyph = qpcVersion === '2' ? entry.qpcV2 : entry.qpcV1;

						return {
							...entry,
							font: BASMALA_FONT,
							qpc: glyph ?? entry.word ?? entry.qpc ?? ''
						};
					}

					if (entry.type === 'surah-header') {
						const surahNumber = entry.surah;
						console.log('Surah header detected for surah number:', surahNumber, entry);

						if (detectedSurah === null && Number.isFinite(surahNumber)) {
							detectedSurah = surahNumber;
						}

						return {
							...entry,
							font: SURAH_HEADER_FONT,
							surahNumber,
							qpc: entry.surah
						};
					}

					return {
						...entry,
						qpc: entry.qpc ?? ''
					};
				});
			});

			const fallbackSurah =
				detectedSurah ??
				hydratedLines
					.flat()
					.find(
						(item: any) =>
							item?.type === 'surah-header' &&
							typeof item.surahNumber === 'number' &&
							Number.isFinite(item.surahNumber)
					)?.surahNumber ??
				null;

			lines = hydratedLines;
			pageSurah = fallbackSurah;
			updateScale();
		} catch (error) {
			console.error(`Failed to load mushaf lines for page ${pageNumber}`, error);
			lines = [];
			pageSurah = null;
		}
	}

	onMount(() => {
		hasMounted = true;
		loadPageLines(page);

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

	$effect(() => {
		if (!hasMounted) return;
		const currentPage = page;
		loadPageLines(currentPage);
	});
</script>

<div
	bind:this={containerRef}
	class="h-full w-full flex items-center justify-center bg-gray-100 overflow-hidden"
>
	<div
		bind:this={pageRef}
		class={'bg-white shadow-xl border border-gray-300 flex flex-col px-8 py-8 overflow-hidden ' +
			(page > 2 ? 'justify-around' : 'justify-center gap-y-5')}
		style="
			width: {BASE_WIDTH}px; 
			height: {BASE_HEIGHT}px; 
			transform: scale({scale}); 
			transform-origin: center;
			aspect-ratio: {A4_RATIO};
		"
	>
		{#if lines !== null}
			{@const allLines = lines}
			{#each Object.entries(allLines) as [lineNumber, entries], index}
				{@const nextLine = allLines[index + 1]}
				{@const nextLineHasSurahHeader =
					nextLine && nextLine.some((entry: any) => entry.type === 'surah-header')}
				{@const shouldJustify =
					page > 2 &&
					!nextLineHasSurahHeader &&
					entries.some((entry: any) => entry.type === 'word')}

				<div
					class={'flex w-full flex-row  ' + (shouldJustify ? 'justify-between' : 'justify-center')}
					dir="rtl"
					data-testid={'line-' + lineNumber}
				>
					{#each entries as entry}
						{#if entry.type === 'surah-header'}
							<div
								class={'text-6xl m-2 text-center w-full h-8  ' +
									(page > 2 ? 'relative' : 'absolute top-0')}
								style="font-family: {entry.font}"
								dir="ltr"
							>
								<img
									src="/assets/surah-header.jpg"
									alt="Banniere"
									class="absolute inset-0 z-0 w-full object-cover"
								/>
								<span class="z-10 absolute inset-0 top-2 scale-120">{entry.qpc}</span>
							</div>
						{:else if entry.type === 'basmala'}
							<div
								class="text-3xl m-2 pt-3 text-center w-full"
								dir="ltr"
								style="font-family: {entry.font}"
							>
								{entry.qpc}
							</div>
						{:else if entry.type === 'word'}
							<div
								class={shouldJustify ? 'text-4xl' : 'text-4xl m-1'}
								style="font-family: {entry.font}"
							>
								{entry.qpc}
							</div>
						{/if}
					{/each}
				</div>
			{/each}

			<!-- Footer -->
			<div class="absolute bottom-2 left-0 right-0">
				<div class="flex justify-between text-sm text-gray-500 px-2">
					<div>Page {page}</div>
					<div class="text-black scale-200">
						{ArabicService.latinToArabicNumbers(page)}
					</div>
					<div>Sourate {pageSurah ?? '?'}</div>
				</div>
			</div>
		{/if}
	</div>
</div>

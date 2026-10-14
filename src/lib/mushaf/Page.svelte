<script lang="ts">
	import { BasmalaLine, SurahHeaderLine, TextLine } from '$lib/classes/Line';
	import Page from '$lib/classes/Page';
	import ArabicService from '$lib/services/arabic';
	import qpcFontProvider from '$lib/services/fontProvider';
	import { onMount } from 'svelte';
	import Line from './Line.svelte';
	import Footer from './Footer.svelte';

	let {
		pageNumber,
		qpcVersion,
		alignment = 'center'
	}: {
		pageNumber: number; // 1-604
		qpcVersion: '1' | '2'; // 1 or 2
		alignment?: 'start' | 'center' | 'end';
	} = $props();

	const alignmentClass = $derived(
		{
			start: 'justify-start',
			center: 'justify-center',
			end: 'justify-end'
		}[alignment] ?? 'justify-center'
	);

	let pageData = $state<Page | null>(null); // Données de la page actuelle
	let pageSurah = $state<number | null>(null); // La première sourate sur la page

	let containerRef: HTMLDivElement;
	let pageRef: HTMLDivElement;
	let scale = $state(1);

	// Ratio A4 : 210mm x 297mm = 0.707
	const A4_RATIO = 210 / 297;
	const BASE_WIDTH = 794; // Base width in pixels (A4 at 96 DPI)
	const BASE_HEIGHT = 1123; // Base height in pixels

	const scaledWidth = $derived(BASE_WIDTH * scale);
	const scaledHeight = $derived(BASE_HEIGHT * scale);

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

	/**
	 * Charge le layout de la page pour l'édition sélectionnée.
	 * @param {number} pageNumber Numéro de page, de 1 à 604.
	 * @param {'1' | '2'} qpcVersion Édition QPC sélectionnée.
	 * @param {AbortSignal} signal Annulation d'un chargement devenu obsolète.
	 * @returns {Promise<void>} Résolution après la mise à jour de la page affichée.
	 */
	async function loadPageLines(pageNumber: number, qpcVersion: '1' | '2', signal: AbortSignal) {
		const key = `/mushaf/QPC${qpcVersion}/page-${String(pageNumber).padStart(3, '0')}.json`;
		const response = await fetch(key, { signal });
		if (!response.ok) throw new Error(`Impossible de charger la page ${pageNumber} en QPC ${qpcVersion}`);
		const json = await response.json();
		if (signal.aborted) return;

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

		updateScale();

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
		const controller = new AbortController();
		pageData = null;
		loadPageLines(pageNumber, qpcVersion, controller.signal).catch((error) => {
			if (error.name !== 'AbortError') console.error(error);
		});
		// Empêche une ancienne réponse de remplacer la page de l'édition courante.
		return () => controller.abort();
	});
</script>

<div
	bind:this={containerRef}
	class={'h-full w-full flex items-center ' + alignmentClass + ' overflow-hidden relative'}
>
	<div
		style="
			width: {scaledWidth}px; 
			height: {scaledHeight}px; 
			aspect-ratio: {A4_RATIO};
		"
	>
		<div
			bind:this={pageRef}
			class={'bg-white shadow-xl border border-gray-300 flex flex-col px-8 py-8 overflow-hidden ' +
				(pageNumber > 2 ? 'justify-around' : 'justify-center gap-y-5')}
			style="
				width: {BASE_WIDTH}px; 
				height: {BASE_HEIGHT}px; 
				transform: scale({scale}); 
				transform-origin: top left;
			"
		>
			{#if pageData !== null}
				{@const allLines = pageData.lines}
				{#each Object.entries(allLines) as [lineNumber, line], index}
					{@const nextLine = allLines[index + 1]}

					<Line {line} {nextLine} {pageNumber} {lineNumber} {qpcVersion} />
				{/each}

				<!-- Footer -->
				<Footer {pageNumber} {pageSurah} />
			{/if}
		</div>
	</div>
</div>

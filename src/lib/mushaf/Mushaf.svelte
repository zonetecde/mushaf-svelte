<script lang="ts">
	import ArabicService from '$lib/services/arabic';
	import QPCFontProvider from '$lib/services/font-provider';
	import { onMount, untrack } from 'svelte';

	let page = 4;
	let pageData: any = $state(null);
	let containerRef: HTMLDivElement;
	let pageRef: HTMLDivElement;
	let scale = $state(1);

	// Ratio A4 : 210mm x 297mm = 0.707
	const A4_RATIO = 210 / 297;
	const BASE_WIDTH = 794; // Largeur de base en pixels (équivalent A4 à 96 DPI)
	const BASE_HEIGHT = 1123; // Hauteur de base en pixels

	function updateScale() {
		if (!containerRef || !pageRef) return;

		const containerRect = containerRef.getBoundingClientRect();
		const containerWidth = containerRect.width;
		const containerHeight = containerRect.height;

		// Calculer le scale basé sur le ratio A4
		const scaleByWidth = containerWidth / BASE_WIDTH;
		const scaleByHeight = containerHeight / BASE_HEIGHT;

		// Prendre le plus petit scale pour que la page reste entièrement visible
		const newScale = Math.min(scaleByWidth, scaleByHeight, 1);
		scale = newScale;
	}

	onMount(() => {
		fetch(`/mushaf-layout/page-${page}.json`)
			.then((res) => res.json())
			.then((data) => {
				pageData = data;
			});

		// Observer le redimensionnement
		const resizeObserver = new ResizeObserver(() => {
			updateScale();
		});

		if (containerRef) {
			resizeObserver.observe(containerRef);
		}

		// Cleanup
		return () => {
			resizeObserver.disconnect();
		};
	});

	const getLines = $derived(() => {
		if (!pageData) return [];
		let lines: any[] = [];

		untrack(() => {
			let currentSurahNumber: number | null = null;
			let lineOffset = 0;

			// Parcourir tous les versets
			pageData.verses.forEach((verse: any, verseIndex: number) => {
				const verseSurahNumber = verse.surahNumber;

				// Vérifier si on change de sourate
				if (currentSurahNumber !== null && currentSurahNumber !== verseSurahNumber) {
					// Ajouter deux lignes d'espacement pour le changement de sourate

					// Ligne 1 : Numéro de sourate (optionnel, vous pouvez la personnaliser)
					lines.push([
						{
							qpc: verseSurahNumber.toString().padStart(3, '0'),
							font: 'surahs',
							isSurahHeader: true
						}
					]);
					lineOffset++;

					// Ligne 2 : Basmala
					lines.push([
						{
							qpc: QPCFontProvider.getBasmalaGlyph('2'),
							font: QPCFontProvider.getBasmalaFont('2'),
							isBasmala: true
						}
					]);
					lineOffset++;
				}

				currentSurahNumber = verseSurahNumber;

				// Fusionne le numéro du verset avec le dernier mot du verset
				// pour éviter que le numéro de verset prenne trop de place
				if (verse.words.length > 1) {
					verse.words[verse.words.length - 2].qpc += ' ' + verse.words[verse.words.length - 1].qpc;
					verse.words.pop();
				}

				// Traiter tous les mots du verset
				verse.words.forEach((word: any) => {
					const targetLineIndex = word.line + lineOffset;

					// S'assurer que le tableau de lignes est assez grand
					while (lines.length <= targetLineIndex) {
						lines.push([]);
					}

					// Ajouter le mot à la ligne correspondante
					lines[targetLineIndex].push({
						qpc: word.qpc,
						font: QPCFontProvider.getFontNameForVerse(verse.surahNumber, verse.verseNumber, '2'),
						isWord: true,
						location: word.location
					});
				});
			});

			// Supprime les lignes vides éventuelles
			lines = lines.filter((line) => line.length > 0);

			// Si on a que 13 lignes, ça veut dire que les premières lignes sont le début de la sourate
			// ou les dernières lignes sont le debut de la sourate suivante.
			if (lines.length === 13) {
				const firstVerse = pageData.verses[0];
				console.log('Premier verset de la page:', firstVerse);

				// Vérifie si le premier verset est le premier verset de la sourate
				if (firstVerse.verseNumber === 1) {
					// Ajoute une ligne vide au début (basmala)
					lines.unshift([
						{
							qpc: QPCFontProvider.getBasmalaGlyph('2'),
							font: QPCFontProvider.getBasmalaFont('2'),
							isBasmala: true
						}
					]);
					// Ajoute encore une ligne avec le numéro de sourate
					lines.unshift([
						{
							qpc: pageData.verses[0].surahNumber.toString().padStart(3, '0'),
							font: 'surahs',
							isSurahHeader: true
						}
					]);
				} else {
					// Ajout deux nouvelles lignes à la fin:
					// une ligne pour le numéro de sourate (sourate suivante)
					lines.push([
						{
							qpc: (pageData.verses[pageData.verses.length - 1].surahNumber + 1)
								.toString()
								.padStart(3, '0'),
							font: 'surahs',
							isSurahHeader: true
						}
					]);
					// une ligne pour la basmala
					lines.push([
						{
							qpc: QPCFontProvider.getBasmalaGlyph('2'),
							font: QPCFontProvider.getBasmalaFont('2'),
							isBasmala: true
						}
					]);
				}
			}

			// Si on a que 14 lignes, alors soit ça veut dire qu'il manque une basmala en première ligne,
			// soit qu'il manque un numéro de sourate en dernière ligne.
			// Si on est au début d'une sourate sur cette page, alors c'est qu'il manque la basmala
			if (lines.length === 14) {
				const firstVerse = pageData.verses[0];
				console.log('Premier verset de la page:', firstVerse);
				if (firstVerse.verseNumber === 1 && firstVerse.surahNumber !== 9) {
					// Ajoute une ligne vide au début (basmala)
					lines.unshift([
						{
							qpc: QPCFontProvider.getBasmalaGlyph('2'),
							font: QPCFontProvider.getBasmalaFont('2'),
							isBasmala: true
						}
					]);
					console.log('Ajout de la basmala au début');
				} else if (firstVerse.surahNumber === 9) {
					// Si on est sur la sourate 9, pas de basmala, mais on ajoute le numéro de sourate au début
					lines.unshift([
						{
							qpc: firstVerse.surahNumber.toString().padStart(3, '0'),
							font: 'surahs',
							isSurahHeader: true
						}
					]);
				} else {
					// Ajoute une ligne avec le numéro de sourate à la fin
					const lastVerse = pageData.verses[pageData.verses.length - 1];
					lines.push([
						{
							qpc: lastVerse.surahNumber.toString().padStart(3, '0'),
							font: 'surahs',
							isSurahHeader: true
						}
					]);
					console.log('Ajout du numéro de sourate à la fin');
				}
			}

			// Si on a que 6 ou 7 lignes, c'est qu'on est sur les deux premières pages (page 1 ou 2)
			// On ajoute la basmala en première ligne pour la page 2, et le numéro de sourate pour les deux pages
			if (lines.length === 7 || lines.length === 6) {
				if (page === 2) {
					lines.unshift([
						{
							qpc: QPCFontProvider.getBasmalaGlyph('2'),
							font: QPCFontProvider.getBasmalaFont('2'),
							isBasmala: true
						}
					]);
				}

				lines.unshift([
					{
						qpc: pageData.verses[0].surahNumber.toString().padStart(3, '0'),
						font: 'surahs',
						isSurahHeader: true
					}
				]);
			}
		});

		console.log('Lignes générées:', lines);
		return lines;
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
		{#if pageData}
			{@const allLines = getLines()}
			{#each Object.entries(allLines) as [lineNumber, words], index}
				{@const nextLine = allLines[index + 1]}
				{@const nextLineHasSurahHeader =
					nextLine && nextLine.some((word: any) => word.isSurahHeader)}
				{@const currentLineHasSurahHeader = words.some((word: any) => word.isSurahHeader)}
				<!-- page > 2: les deux premières page du mushaf sont spéciales (cercles donc justify-center) -->
				{@const shouldJustify =
					page > 2 && !nextLineHasSurahHeader && words.some((word: any) => word.isWord)}

				<div
					class={'flex w-full flex-row  ' + (shouldJustify ? 'justify-between' : 'justify-center')}
					dir="rtl"
					data-testid={'line-' + lineNumber}
				>
					{#each words as word}
						{#if word.isSurahHeader}
							<div
								class={'text-6xl m-2 text-center w-full h-8  ' +
									(page > 2 ? 'relative' : 'absolute top-0')}
								style="font-family: {word.font}"
								dir="ltr"
							>
								<img
									src="/assets/surah-header.jpg"
									alt="Bannière"
									class="absolute inset-0 z-0 w-full object-cover"
								/>
								<span class="z-10 absolute inset-0 top-2 scale-120">{word.qpc}</span>
							</div>
						{:else if word.isBasmala}
							<div class="text-3xl m-2 pt-3 text-center w-full" style="font-family: {word.font}">
								{word.qpc}
							</div>
						{:else}
							<div
								class={shouldJustify ? 'text-4xl' : 'text-4xl m-1'}
								style="font-family: {word.font}"
							>
								{word.qpc}
							</div>
						{/if}
					{/each}
				</div>
			{/each}

			<!-- Pied de page -->
			<div class="absolute bottom-2 left-0 right-0">
				<div class="flex justify-between text-sm text-gray-500 px-2">
					<div>Page {page}</div>
					<div class="text-black scale-200">
						{ArabicService.latinToArabicNumbers(page)}
					</div>
					<div>Sourate {pageData.verses[0].surahNumber}</div>
				</div>
			</div>
		{/if}
	</div>
</div>

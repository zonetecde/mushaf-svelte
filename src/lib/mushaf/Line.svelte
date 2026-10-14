<script lang="ts">
	import { BasmalaLine, SurahHeaderLine, TextLine } from '$lib/classes/Line';
	import qpcFontProvider from '$lib/services/fontProvider';

	let {
		line,
		nextLine,
		pageNumber,
		lineNumber,
		qpcVersion
	}: {
		line: BasmalaLine | SurahHeaderLine | TextLine;
		nextLine: BasmalaLine | SurahHeaderLine | TextLine | null;
		pageNumber: number;
		lineNumber: string;
		qpcVersion: '1' | '2';
	} = $props();

	const SURAH_HEADER_FONT = 'surahs';
	const BASMALA_FONT = $derived(qpcFontProvider.getBasmalaFont(qpcVersion));

	const nextLineHasSurahHeader = $derived(() => {
		return nextLine && nextLine.type === 'surah-header';
	});
	let shouldJustify = $derived(() => {
		// On ne justifie pas les deux premières pages (en forme de cercle)
		return (
			pageNumber > 2 &&
			// On ne justifie pas les lignes qui sont suivies d'une entête de sourate
			// (= dernière ligne d'une sourate)
			!nextLineHasSurahHeader() &&
			// Pour toutes les dernières pages du mushaf, on centre les dernières lignes
			// qui sont la fin des petites sourates (les justifiers crée de trop grands espaces)
			(lineNumber != '14' || pageNumber <= 599)
		);
	});
</script>

<!-- Ligne du mushaf -->
<div
	class={'flex w-full flex-row  ' + (shouldJustify() ? 'justify-between' : 'justify-center')}
	dir="rtl"
	data-testid={'line-' + lineNumber}
>
	{#if line.type === 'surah-header'}
		<div
			class={'text-6xl text-center w-full h-18 ' + (pageNumber > 2 ? 'relative' : 'absolute top-0')}
			style="font-family: {SURAH_HEADER_FONT}"
			dir="ltr"
		>
			<img
				src="/assets/surah-header.jpg"
				alt="Surah Header Background"
				class="absolute inset-0 w-full h-full"
			/>
			<span class="z-10 absolute inset-0 scale-120 mt-3"
				>{(line as SurahHeaderLine).surahNumber}</span
			>
		</div>
	{:else if line.type === 'basmala'}
		<div class="text-3xl m-2 pt-3 text-center w-full" dir="ltr" style="font-family: {BASMALA_FONT}">
			{qpcFontProvider.getBasmalaGlyph(qpcVersion)}
		</div>
	{:else if line.type === 'text'}
		{#each (line as TextLine).words as word}
			<div
				class={shouldJustify() ? 'text-4xl text-nowrap' : 'text-4xl m-1 text-nowrap'}
				style="font-family: {qpcFontProvider.getFontNameForWord(word, qpcVersion)}"
			>
				{qpcVersion === '2' ? word.qpcV2 : word.qpcV1}
			</div>
		{/each}
	{/if}
</div>

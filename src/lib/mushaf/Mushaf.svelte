<script lang="ts">
	import QPCFontProvider from '$lib/services/font-provider';
	import { onMount, untrack } from 'svelte';

	let page = 604;
	let pageData: any = $state(nu	cons
	onMount(() => {
		fetch(`/mushaf-layout/page-${page}.json`)
			.then((res) => res.json())
			.then((data) => {
				pageData = data;
			});
	});

	const getLines = $derived(() => {
		if (!pageData) return [];
		let lines: { [key: string]: any[] } = {};

		untrack(() => {
			pageData.verses.forEach((verse: any) => {
				let oldSurahNumber = verse.words[0].surahNumber;

				verse.words.forEach((word: any) => {
					const wordLine = word.line;
					if (!lines[wordLine]) {
						lines[wordLine] = [];
					}
					lines[wordLine].push({
						qpc: word.qpc,
						font: QPCFontProvider.getFontNameForVerse(verse.surahNumber, verse.verseNumber, '2')
					});

					oldSurahNumber = word.surahNumber;
				});
			});
		});

		console.log(lines);
		return lines;
	});
</script>

<div class="h-full w-1/3 bg-red-200 mx-auto">
	{#if pageData}
		{#each Object.entries(getLines()) as [lineNumber, words]}
			<div class="flex justify-center" dir="rtl">
				{#each words as word}
					<div class="text-4xl m-1" style="font-family: {word.font}">{word.qpc}</div>
				{/each}
			</div>
t}">{word.qpc}</div>
				{/each}
			</div>
		{/each}
	{/if}
</div>

import type Word from '$lib/classes/Word';
import { SvelteSet } from 'svelte/reactivity';

class QPCFontProvider {
	private static instance: QPCFontProvider;

	qpc2Glyphs: Record<string, string> | undefined = undefined;
	qpc1Glyphs: Record<string, string> | undefined = undefined;
	verseMappingV2: Record<string, string> | undefined = undefined;
	verseMappingV1: Record<string, string> | undefined = undefined;
	loadedFonts: Set<string> = new SvelteSet<string>();

	private constructor() {}

	static getInstance(): QPCFontProvider {
		if (!QPCFontProvider.instance) {
			QPCFontProvider.instance = new QPCFontProvider();
		}
		return QPCFontProvider.instance;
	}

	async loadQPC2Data() {
		if (!this.qpc2Glyphs) {
			this.qpc2Glyphs = await (await fetch('/QPC2/qpc-v2.json')).json();
		}
		if (!this.qpc1Glyphs) {
			this.qpc1Glyphs = await (await fetch('/QPC1/qpc-v1.json')).json();
		}

		if (!this.verseMappingV2) {
			// verse-mapping by Primo - May Allah reward him for his work
			this.verseMappingV2 = await (await fetch('/QPC2/verse-mapping.json')).json();
		}
		if (!this.verseMappingV1) {
			// verse-mapping by Primo - May Allah reward him for his work
			this.verseMappingV1 = await (await fetch('/QPC1/verse-mapping.json')).json();
		}

		// Charge déjà le fichier font avec la basmala
		this.loadFontIfNotLoaded('QPC1BSML', '1');
		this.loadFontIfNotLoaded('QPC2BSML', '2');
	}

	/**
	 * Charge dynamiquement une police QCP si elle n'est pas déjà chargée
	 */
	loadFontIfNotLoaded(fontName: string, version: '1' | '2') {
		// Vérifie si la police est déjà chargée
		if (this.loadedFonts.has(fontName)) {
			return;
		}

		// Crée une nouvelle règle @font-face
		const style = document.createElement('style');

		// Les polices contenant les basmala/isti3adha sont au format ttf
		const extension = fontName.includes('BSML') ? 'ttf' : 'woff2';
		const format = fontName.includes('BSML') ? 'truetype' : 'woff2';

		style.textContent = `
			@font-face {
				font-family: '${fontName}';
				src: url('/QPC${version}/fonts/${fontName}.${extension}') format('${format}');
				font-weight: normal;
				font-style: normal;
			}
		`;
		document.head.appendChild(style);

		// Marque la police comme chargée
		this.loadedFonts.add(fontName);
	}

	/**
	 * Précharge une police sans la marquer comme chargée de manière réactive
	 */
	preloadFont(fontName: string, version: '1' | '2') {
		// Utilise setTimeout pour éviter les mutations d'état dans les contextes réactifs
		setTimeout(() => {
			this.loadFontIfNotLoaded(fontName, version);
		}, 0);
	}

	getFontNameForWord(word: Word, qpcVersion: '1' | '2'): string {
		// Get the font name for the verse
		const verseKey = `${word.getSurahNumber()}:${word.getVerseNumber()}`;

		const fontName =
			qpcVersion === '1'
				? this.verseMappingV1![verseKey] || 'QPC1_p0001'
				: this.verseMappingV2![verseKey] || 'QPC2_p0001';

		// Précharge la police de manière asynchrone pour éviter les mutations d'état
		this.preloadFont(fontName, qpcVersion);

		return fontName;
	}

	getQuranVerseGlyph(
		surah: number,
		verse: number,
		startWord: number,
		endWord: number,
		isLastWords: boolean,
		qpcVersion: '1' | '2' = '2'
	): string {
		let str = '';
		for (let i = startWord + 1; i <= endWord + 1; i++) {
			const key = `${surah}:${verse}:${i}`;
			const glyph = qpcVersion === '1' ? this.qpc1Glyphs![key] : this.qpc2Glyphs![key];
			if (glyph) {
				str += glyph + ' ';
			}
		}

		if (isLastWords) {
			const key = `${surah}:${verse}:${endWord + 2}`;
			const glyph = qpcVersion === '1' ? this.qpc1Glyphs![key] : this.qpc2Glyphs![key];
			if (glyph) {
				str += glyph; // Ajoute le symbole du numéro de verset
			}
		}

		return str.trim();
	}

	getBasmalaGlyph(version: '1' | '2'): string {
		switch (version) {
			case '1':
				return '#"!'; // ou alors peut-être -,+*
			case '2':
				return 'ﭑﭒﭓ';
			default:
				return '';
		}
	}

	getIstiadhahGlyph(version: '1' | '2'): string {
		switch (version) {
			case '1':
				return 'FEDCB'.split('').join(' ');
			case '2':
				return 'ﭲﭳﭴﭵﭶ'.split('').join(' ');
			default:
				return '';
		}
	}

	getBasmalaFont(version: '1' | '2'): string {
		switch (version) {
			case '1':
				return 'QPC1BSML';
			case '2':
				return 'QPC2BSML';
			default:
				return '';
		}
	}
}

// Exporte une instance singleton
export const qpcFontProvider = QPCFontProvider.getInstance();
export default qpcFontProvider;

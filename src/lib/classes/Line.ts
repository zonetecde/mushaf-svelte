import type Word from './Word';

export default class Line {
	type: 'text' | 'basmala' | 'surah-header';

	constructor(type: 'text' | 'basmala' | 'surah-header') {
		this.type = type;
	}
}

export class SurahHeaderLine extends Line {
	surahNumber: number;

	constructor(surahNumber: number) {
		super('surah-header');
		this.surahNumber = surahNumber;
	}
}

export class TextLine extends Line {
	words: Word[];
	text: string;
	verseRange: string;

	constructor(words: Word[], text: string = '', verseRange: string = '') {
		super('text');
		this.words = words;
		this.text = text;
		this.verseRange = verseRange;
	}
}

export class BasmalaLine extends Line {
	constructor() {
		super('basmala');
	}
}

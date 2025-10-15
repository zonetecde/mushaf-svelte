class Line {
	type: 'text' | 'basmala' | 'surah-header';

	constructor(type: 'text' | 'basmala' | 'surah-header') {
		this.type = type;
	}
}

class SurahHeaderLine extends Line {
	surahNumber: number;

	constructor(surahNumber: number) {
		super('surah-header');
		this.surahNumber = surahNumber;
	}
}

class TextLine extends Line {
	words: Word[];

	constructor(words: Word[]) {
		super('text');
		this.words = words;
	}
}

class BasmalaLine extends Line {
	constructor() {
		super('basmala');
	}
}

class TextLine extends Line {
	words: Word[];

	constructor(words: Word[]) {
		super('text');
		this.words = words;
	}
}

class BasmalaLine extends Line {
	constructor() {
		super('basmala');
	}
}

export default class Word {
	location: string; // e.g., "2:255:1"
	word: string; // The actual Arabic word
	qpcV1: string; // Glyph for QPC version 1
	qpcV2: string; // Glyph for QPC version 2

	/**
	 * Conserve les glyphes disponibles dans le jeu de données de l'édition choisie.
	 * @param {string} location Position du mot dans le verset.
	 * @param {string} word Texte arabe du mot.
	 * @param {string} qpcV1 Glyphes QPC V1, absents dans le jeu V2.
	 * @param {string} qpcV2 Glyphes QPC V2, absents dans le jeu V1.
	 */
	constructor(location: string, word: string, qpcV1: string = '', qpcV2: string = '') {
		this.location = location;
		this.word = word;
		this.qpcV1 = qpcV1;
		this.qpcV2 = qpcV2;
	}

	getSurahNumber(): number | null {
		const [surah] = this.location.split(':').map(Number);
		return !isNaN(surah) ? surah : null;
	}

	getVerseNumber(): number | null {
		const [, verse] = this.location.split(':').map(Number);
		return !isNaN(verse) ? verse : null;
	}
}

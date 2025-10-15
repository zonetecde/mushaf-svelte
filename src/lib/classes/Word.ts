class Word {
	location: string; // e.g., "2:255:1"
	word: string; // The actual Arabic word
	qpcV1: string; // Glyph for QPC version 1
	qpcV2: string; // Glyph for QPC version 2

	constructor(location: string, word: string, qpcV1: string, qpcV2: string) {
		this.location = location;
		this.word = word;
		this.qpcV1 = qpcV1;
		this.qpcV2 = qpcV2;
	}
}

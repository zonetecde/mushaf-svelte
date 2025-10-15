/* eslint-disable @typescript-eslint/no-explicit-any */
class Page {
	lines: Line[];

	constructor(public pageNumber: number) {
		this.lines = [];
	}

	static fromJSON(data: any): Page {
		const page = new Page(data.pageNumber);
		page.lines = data.lines.map((lineData: any) => {
			switch (lineData.type) {
				case 'text':
					return new TextLine(
						lineData.words.map(
							(wordData: any) =>
								new Word(wordData.location, wordData.word, wordData.qpcV1, wordData.qpcV2)
						)
					);
				case 'basmala':
					return new BasmalaLine();
				case 'surah-header':
					return new SurahHeaderLine(lineData.surahNumber);
				default:
					throw new Error(`Unknown line type: ${lineData.type}`);
			}
		});
		return page;
	}
}

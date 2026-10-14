import type Line from './Line';
import { BasmalaLine, SurahHeaderLine, TextLine } from './Line';
import Word from './Word';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Page {
	lines: Line[];

	constructor(public pageNumber: number) {
		this.lines = [];
	}

	static fromJSON(data: any): Page {
		const page = new Page(data.page);
		page.lines = data.lines.map((lineData: any) => {
			const lineType = lineData.type;

			switch (lineType) {
				case 'text': {
					const words = lineData.words.map(
						(wordData: any) =>
							new Word(wordData.location, wordData.word, wordData.qpcV1, wordData.qpcV2)
					);

					return new TextLine(words, lineData.text, lineData.verseRange);
				}
				case 'basmala':
					return new BasmalaLine();
				case 'surah-header':
					return new SurahHeaderLine(lineData.surah);
				default:
					throw new Error(`Unknown line type: ${lineData.type}`);
			}
		});
		return page;
	}
}

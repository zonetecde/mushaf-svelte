export default class ArabicService {
	static latinToArabicNumbers(input: number | string): string {
		const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
		return input
			.toString()
			.split('')
			.map((char) => (/\d/.test(char) ? arabicNumbers[parseInt(char, 10)] : char))
			.join('');
	}
}

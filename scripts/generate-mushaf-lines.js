import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Services adaptés pour Node.js
class ArabicService {
	static latinToArabicNumbers(input) {
		const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
		return input
			.toString()
			.split('')
			.map((char) => (/\d/.test(char) ? arabicNumbers[parseInt(char, 10)] : char))
			.join('');
	}
}

class QPCFontProvider {
	// Propriétés statiques pour stocker les données QPC
	static qpc2Glyphs = null;
	static qpc1Glyphs = null;
	static verseMappingV2 = null;
	static verseMappingV1 = null;

	static async loadQPCData() {
		const staticPath = path.join(__dirname, '..', 'static');

		try {
			if (!QPCFontProvider.qpc2Glyphs) {
				const qpc2Path = path.join(staticPath, 'QPC2', 'qpc-v2.json');
				if (fs.existsSync(qpc2Path)) {
					QPCFontProvider.qpc2Glyphs = JSON.parse(fs.readFileSync(qpc2Path, 'utf8'));
				}
			}

			if (!QPCFontProvider.qpc1Glyphs) {
				const qpc1Path = path.join(staticPath, 'QPC1', 'qpc-v1.json');
				if (fs.existsSync(qpc1Path)) {
					QPCFontProvider.qpc1Glyphs = JSON.parse(fs.readFileSync(qpc1Path, 'utf8'));
				}
			}

			if (!QPCFontProvider.verseMappingV2) {
				const mappingV2Path = path.join(staticPath, 'QPC2', 'verse-mapping.json');
				if (fs.existsSync(mappingV2Path)) {
					QPCFontProvider.verseMappingV2 = JSON.parse(fs.readFileSync(mappingV2Path, 'utf8'));
				}
			}

			if (!QPCFontProvider.verseMappingV1) {
				const mappingV1Path = path.join(staticPath, 'QPC1', 'verse-mapping.json');
				if (fs.existsSync(mappingV1Path)) {
					QPCFontProvider.verseMappingV1 = JSON.parse(fs.readFileSync(mappingV1Path, 'utf8'));
				}
			}
		} catch (error) {
			console.warn('Impossible de charger les données QPC:', error.message);
		}
	}

	static getWordGlyph(surah, verse, wordPosition, qpcVersion = '2') {
		const key = `${surah}:${verse}:${wordPosition}`;

		if (qpcVersion === '1' && QPCFontProvider.qpc1Glyphs) {
			return QPCFontProvider.qpc1Glyphs[key] || '';
		} else if (qpcVersion === '2' && QPCFontProvider.qpc2Glyphs) {
			return QPCFontProvider.qpc2Glyphs[key] || '';
		}

		return '';
	}

	static getBasmalaGlyph(version) {
		switch (version) {
			case '1':
				return '#"!'; // ou alors peut-être -,+*
			case '2':
				return 'ﭑﭒﭓ';
			default:
				return '';
		}
	}

	static getBasmalaFont(version) {
		switch (version) {
			case '1':
				return 'QPC1BSML';
			case '2':
				return 'QPC2BSML';
			default:
				return '';
		}
	}

	static getFontNameForVerse(surah, verse, qpcVersion) {
		// Logique simplifiée - dans l'idéal, il faudrait charger les mappings JSON
		// Pour l'instant, on utilise une valeur par défaut
		return qpcVersion === '1' ? 'QPC1_p0001' : 'QPC2_p0001';
	}

	static getQuranVerseGlyph(surah, verse, startWord, endWord, isLastWords, qpcVersion = '2') {
		let str = '';
		for (let i = startWord + 1; i <= endWord + 1; i++) {
			const key = `${surah}:${verse}:${i}`;
			const glyph =
				qpcVersion === '1' ? QPCFontProvider.qpc1Glyphs?.[key] : QPCFontProvider.qpc2Glyphs?.[key];
			if (glyph) {
				str += glyph + ' ';
			}
		}

		if (isLastWords) {
			const key = `${surah}:${verse}:${endWord + 2}`;
			const glyph =
				qpcVersion === '1' ? QPCFontProvider.qpc1Glyphs?.[key] : QPCFontProvider.qpc2Glyphs?.[key];
			if (glyph) {
				str += glyph; // Ajoute le symbole du numéro de verset
			}
		}

		return str.trim();
	}
}

function generateLines(pageData, page) {
	let lines = [];
	let currentSurahNumber = null;
	let lineOffset = 0;

	// Parcourir tous les versets
	pageData.verses.forEach((verse) => {
		const verseSurahNumber = verse.surahNumber;

		// Vérifier si on change de sourate
		if (currentSurahNumber !== null && currentSurahNumber !== verseSurahNumber) {
			// Ajouter deux lignes d'espacement pour le changement de sourate

			// Ligne 1 : Numéro de sourate
			lines.push([
				{
					type: 'surah-header',
					surah: verseSurahNumber.toString().padStart(3, '0')
				}
			]);
			lineOffset++;

			// Ligne 2 : Basmala
			lines.push([
				{
					qpc: QPCFontProvider.getBasmalaGlyph('2'),
					font: QPCFontProvider.getBasmalaFont('2'),
					isBasmala: true
				}
			]);
			lineOffset++;
		}

		currentSurahNumber = verseSurahNumber;

		// Copier les mots pour éviter de modifier les données originales
		const words = [...verse.words];

		// Fusionne le numéro du verset avec le dernier mot du verset
		// pour éviter que le numéro de verset prenne trop de place
		if (words.length > 1) {
			words[words.length - 2].qpc += ' ' + words[words.length - 1].qpc;
			words.pop();
		}

		// Traiter tous les mots du verset
		words.forEach((word) => {
			const targetLineIndex = word.line + lineOffset;

			// S'assurer que le tableau de lignes est assez grand
			while (lines.length <= targetLineIndex) {
				lines.push([]);
			}

			// Obtenir le glyphe QPC V1 pour ce mot
			const qpcV1Glyph = QPCFontProvider.getWordGlyph(
				verse.surahNumber,
				verse.verseNumber,
				word.position,
				'1'
			);

			// Ajouter le mot à la ligne correspondante
			lines[targetLineIndex].push({
				type: 'word',
				location: word.location,
				word: word.text,
				qpcV2: word.qpc,
				qpcV1: qpcV1Glyph
			});
		});
	});

	// Supprime les lignes vides éventuelles
	lines = lines.filter((line) => line.length > 0);

	// Si on a que 13 lignes, ça veut dire que les premières lignes sont le début de la sourate
	// ou les dernières lignes sont le debut de la sourate suivante.
	if (lines.length === 13) {
		const firstVerse = pageData.verses[0];
		console.log('Premier verset de la page:', firstVerse);

		// Vérifie si le premier verset est le premier verset de la sourate
		if (firstVerse.verseNumber === 1) {
			// Ajoute une ligne vide au début (basmala)
			lines.unshift([
				{
					type: 'basmala',
					qpcV2: QPCFontProvider.getBasmalaGlyph('2'),
					qpcV1: QPCFontProvider.getBasmalaGlyph('1')
				}
			]);
			// Ajoute encore une ligne avec le numéro de sourate
			lines.unshift([
				{
					type: 'surah-header',
					surah: pageData.verses[0].surahNumber.toString().padStart(3, '0')
				}
			]);
		} else {
			// Ajout deux nouvelles lignes à la fin:
			// une ligne pour le numéro de sourate (sourate suivante)
			lines.push([
				{
					type: 'surah-header',
					surah: (pageData.verses[pageData.verses.length - 1].surahNumber + 1)
						.toString()
						.padStart(3, '0')
				}
			]);
			// une ligne pour la basmala
			lines.push([
				{
					type: 'basmala',
					qpcV2: QPCFontProvider.getBasmalaGlyph('2'),
					qpcV1: QPCFontProvider.getBasmalaGlyph('1')
				}
			]);
		}
	}

	// Si on a que 14 lignes, alors soit ça veut dire qu'il manque une basmala en première ligne,
	// soit qu'il manque un numéro de sourate en dernière ligne.
	// Si on est au début d'une sourate sur cette page, alors c'est qu'il manque la basmala
	if (lines.length === 14) {
		const firstVerse = pageData.verses[0];
		console.log('Premier verset de la page:', firstVerse);
		if (firstVerse.verseNumber === 1 && firstVerse.surahNumber !== 9) {
			// Ajoute une ligne vide au début (basmala)
			lines.unshift([
				{
					type: 'basmala',
					qpcV2: QPCFontProvider.getBasmalaGlyph('2'),
					qpcV1: QPCFontProvider.getBasmalaGlyph('1')
				}
			]);
			console.log('Ajout de la basmala au début');
		} else if (firstVerse.surahNumber === 9) {
			// Si on est sur la sourate 9, pas de basmala, mais on ajoute le numéro de sourate au début
			lines.unshift([
				{
					type: 'surah-header',
					surah: firstVerse.surahNumber.toString().padStart(3, '0')
				}
			]);
		} else {
			// Ajoute une ligne avec le numéro de sourate à la fin
			const lastVerse = pageData.verses[pageData.verses.length - 1];
			lines.push([
				{
					type: 'surah-header',
					surah: lastVerse.surahNumber.toString().padStart(3, '0')
				}
			]);
			console.log('Ajout du numéro de sourate à la fin');
		}
	}

	// Si on a que 6 ou 7 lignes, c'est qu'on est sur les deux premières pages (page 1 ou 2)
	// On ajoute la basmala en première ligne pour la page 2, et le numéro de sourate pour les deux pages
	if (lines.length === 7 || lines.length === 6) {
		if (page === 2) {
			lines.unshift([
				{
					type: 'basmala',
					qpcV2: QPCFontProvider.getBasmalaGlyph('2'),
					qpcV1: QPCFontProvider.getBasmalaGlyph('1')
				}
			]);
		}

		lines.unshift([
			{
				type: 'surah-header',
				surah: pageData.verses[0].surahNumber.toString().padStart(3, '0')
			}
		]);
	}

	console.log(`Page ${page}: ${lines.length} lignes générées`);
	return lines;
}

async function generateAllPages() {
	const staticPath = path.join(__dirname, '..', 'static');
	const mushafLayoutPath = path.join(staticPath, 'mushaf-layout');
	const outputPath = path.join(__dirname, 'mushaf');

	console.log('Démarrage de la génération des lignes du mushaf...');
	console.log('Chemin des données source:', mushafLayoutPath);
	console.log('Chemin de sortie:', outputPath);

	// Charger les données QPC
	console.log('Chargement des données QPC...');
	await QPCFontProvider.loadQPCData();

	// Vérifier que le dossier de sortie existe
	if (!fs.existsSync(outputPath)) {
		fs.mkdirSync(outputPath, { recursive: true });
	}

	let successCount = 0;
	let errorCount = 0;

	for (let page = 1; page <= 604; page++) {
		try {
			const inputFile = path.join(mushafLayoutPath, `page-${page}.json`);
			const outputFile = path.join(outputPath, `page-${page.toString().padStart(3, '0')}.json`);

			// Vérifier si le fichier source existe
			if (!fs.existsSync(inputFile)) {
				console.warn(`⚠️  Fichier source manquant: page-${page}.json`);
				errorCount++;
				continue;
			}

			// Lire les données de la page
			const pageData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

			// Générer les lignes
			const lines = generateLines(pageData, page);

			// Sauvegarder le résultat
			fs.writeFileSync(outputFile, JSON.stringify({ lines }, null, 2), 'utf8');

			successCount++;

			// Afficher le progrès tous les 50 pages
			if (page % 50 === 0 || page <= 10 || page > 594) {
				console.log(`✅ Page ${page}/604 traitée`);
			}
		} catch (error) {
			console.error(`❌ Erreur lors du traitement de la page ${page}:`, error.message);
			errorCount++;
		}
	}

	console.log('\n🎉 Génération terminée !');
	console.log(`✅ Pages traitées avec succès: ${successCount}`);
	console.log(`❌ Erreurs: ${errorCount}`);
	console.log(`📁 Fichiers générés dans: ${outputPath}`);
}

// Exécuter le script
generateAllPages().catch(console.error);
export { generateLines, ArabicService, QPCFontProvider };

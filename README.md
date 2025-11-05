# Mushaf Ihab

Projet Svelte permettant de lire le mushaf de Hafs par Assim avec la calligraphie uthmanienne. L'application offre une navigation rapide (sourate, page, juz, hizb), une vue double page ou page simple et le choix de la version de la police QPC.

## Apercu du projet
- Interface Svelte reactive concue pour la lecture du mushaf.
- Composants dedies (`src/lib/mushaf`) pour structurer pages, lignes et mots.
- Donnees generees a partir du depot <https://github.com/zonetecde/mushaf-layout>.

## Fonctionnalites principales
- Navigation instantanee par sourate, page, juz ou hizb.
- Affichage en double page ou page unique selon la preference.
- Selection de la variante QPC souhaitee pour la police du mushaf.
- Experience optimisee autour de la calligraphie uthmanienne.

## Structure essentielle
- `src/lib/mushaf` : composants Svelte pour le mushaf (page, ligne, navigation, footer).
- `src/lib/classes` : classes TypeScript `Page`, `Line`, `Word` pour manipuler la structure du texte.
- `static` : ressources statiques exposees telles que polices ou images.
- `e2e` : tests end-to-end Playwright.

## Prise en main
```bash
npm install
npm run dev
```
Le script `npm run dev` lance le serveur de developpement Vite avec SvelteKit.

Pour une construction de production :
```bash
npm run build
npm run preview
```

## Scripts npm utiles
- `npm run dev` : demarrage du serveur de developpement.
- `npm run build` : construction de la version production.
- `npm run preview` : previsualisation locale de la build.
- `npm run check` : verification Svelte + TypeScript.
- `npm run lint` : verifications Prettier et ESLint.
- `npm run test:e2e` : tests Playwright.

## Hebergement
Le site est heberge sur <https://mondomaine.fr>.

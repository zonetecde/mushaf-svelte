# Mushaf Ihab

Mushaf Ihab est une application Svelte dédiée à la lecture du mushaf de Hafs par Assim dans une calligraphie uthmanienne fidèle. L'interface a été pensée pour rester simple et rapide, tout en offrant plusieurs modes d'affichage et de navigation afin de retrouver instantanément la sourate, la page, le juz ou le hizb souhaité.

<p align="center">
  <img  width="80%" alt="scr1" src="https://github.com/user-attachments/assets/87f8defc-89f7-4d62-8a53-dd3a7120f6a8" />
</p>
<p align="center">
  <img  width="80%" alt="scr2" src="https://github.com/user-attachments/assets/a8e52a08-22cd-41bf-bb4b-f69aa44db339" />
</p>


## Aperçu

- Lecture Svelte réactive avec des composants spécialisés (`src/lib/mushaf`) pour les pages, lignes et mots.
- Données générées via le dépôt compagnon : <https://github.com/zonetecde/mushaf-layout>.
- Police QPC ajustable pour sélectionner la variante de graphie la plus adaptée.

## Fonctionnalités clés

- Navigation rapide par sourate, page, juz ou hizb grâce aux outils intégrés.
- Choix du mode de lecture : double page pour une vision d'ensemble ou page unique pour un focus maximal.
- Respect de la calligraphie uthmanienne et rendu optimisé pour une lecture confortable.

## Architecture en bref

- `src/lib/mushaf` : composants Svelte (Mushaf, Page, Line, Word, Footer...) assurant l'affichage.
- `src/lib/classes` : classes TypeScript `Page`, `Line`, `Word` structurant les données du mushaf.
- `static` : ressources statiques, notamment polices et fichiers JSON de données.

## Démarrer

```bash
npm install
npm run dev
```

Ces commandes installent les dépendances puis lancent le serveur en mode développement.

## Hébergement

La version en ligne est disponible sur https://mushaf-svelte.vercel.app/.

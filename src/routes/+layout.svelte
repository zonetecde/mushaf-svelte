<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import QPCFontProvider from '$lib/services/fontProvider';

	const HEAD_TITLE = 'Mushaf Svelte - Lecture du mushaf Hafs par Assim';
	const HEAD_DESCRIPTION =
		'Application Svelte pour consulter le mushaf de Hafs par Assim dans une calligraphie uthmanienne, avec navigation rapide et sélection de la police QPC.';
	const HEAD_KEYWORDS = 'mushaf,hafs,assim,coran,quran,qpc,svelte,lecture,uthmanienne';

	let { children } = $props();

	let isFontLoaded = $state(false);

	onMount(async () => {
		await QPCFontProvider.loadQPC2Data();
		isFontLoaded = true;
	});
</script>

<svelte:head>
	<title>{HEAD_TITLE}</title>
	<meta name="description" content={HEAD_DESCRIPTION} />
	<meta name="keywords" content={HEAD_KEYWORDS} />
	<meta name="author" content="Zonetecde" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={HEAD_TITLE} />
	<meta property="og:description" content={HEAD_DESCRIPTION} />
	<meta property="og:locale" content="fr_FR" />
	<meta property="og:image:alt" content="Calligraphie uthmanienne du mushaf de Hafs par Assim" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={HEAD_TITLE} />
	<meta name="twitter:description" content={HEAD_DESCRIPTION} />
	<meta name="twitter:image:alt" content="Calligraphie uthmanienne du mushaf de Hafs par Assim" />
	<meta name="theme-color" content="#0f172a" />
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !isFontLoaded}
	<div class="h-screen w-screen flex items-center justify-center">Chargement des polices...</div>
{:else}
	<div class="h-screen w-screen">
		{@render children?.()}
	</div>
{/if}

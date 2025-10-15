<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import QPCFontProvider from '$lib/services/fontProvider';

	let { children } = $props();

	let isFontLoaded = $state(false);

	onMount(async () => {
		await QPCFontProvider.loadQPC2Data();
		isFontLoaded = true;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !isFontLoaded}
	<div class="h-screen w-screen flex items-center justify-center">Chargement des polices...</div>
{:else}
	<div class="h-screen w-screen">
		{@render children?.()}
	</div>
{/if}

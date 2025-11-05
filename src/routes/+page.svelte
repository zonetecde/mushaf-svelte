<script lang="ts">
	import { onMount } from 'svelte';
	import Mushaf from '$lib/mushaf/Mushaf.svelte';
	import Navigation from '$lib/navigation/Navigation.svelte';
	import QuickNavigation from '$lib/navigation/QuickNavigation.svelte';
	import QuickSettings from '$lib/settings/QuickSettings.svelte';

	let pageNumber = 1;
	let qpcVersion: '1' | '2' = '2';
	let doublePagePreference = false;
	let isMobile = false;

	onMount(() => {
		const mediaQuery = window.matchMedia('(max-width: 768px)');

		const updateIsMobile = () => {
			isMobile = mediaQuery.matches;
		};

		updateIsMobile();
		mediaQuery.addEventListener('change', updateIsMobile);

		return () => mediaQuery.removeEventListener('change', updateIsMobile);
	});

	$: effectiveDoublePage = !isMobile && doublePagePreference;
</script>

<div class="relative flex h-full w-full flex-col md:flex-row">
	<Navigation bind:pageNumber doublePage={effectiveDoublePage} {isMobile} />

	<div class="flex h-full flex-1 flex-col">
		<div class="flex-1 overflow-hidden px-2 pb-32 pt-4 md:px-0 md:py-0">
			<Mushaf {pageNumber} {qpcVersion} doublePage={effectiveDoublePage} />
		</div>
		<div class="flex flex-col gap-2 md:relative md:gap-0">
			<QuickNavigation bind:pageNumber doublePage={effectiveDoublePage} />
			<QuickSettings bind:doublePage={doublePagePreference} bind:qpcVersion {isMobile} />
		</div>
	</div>
</div>

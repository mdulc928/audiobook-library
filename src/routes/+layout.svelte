<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Toast from '$lib/designSystem/components/Toast/Toast.svelte';
	import { onMount } from 'svelte';
	import { initFirebase } from '$lib/app/firebase.client.svelte';

	// init firebase
	onMount(() => {
		initFirebase();
	});

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div>
	{@render children()}
</div>
<div style="display:none">
	{#each locales as locale (locale)}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>
<Toast />

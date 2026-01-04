<script lang="ts">
	import { page } from '$app/state';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import { resolve } from '$app/paths';
	import HouseIcon from '$lib/designSystem/icons/HouseIcon.svelte';

	let { class: customClasses = '' } = $props();
</script>

<nav class={cc('sticky top-0 z-40 w-full backdrop-blur-sm', customClasses)}>
	<div class="mx-auto flex h-14 items-center justify-between px-4">
		<a
			href={resolve('/books')}
			class="flex items-center gap-2 text-lg font-bold tracking-tight text-white hover:text-white/80"
		>
			<HouseIcon /> Kreyòl Pale
		</a>

		<div class="flex items-center gap-6">
			<!-- {#each links as link (link.href)} -->
			<a
				href={resolve('/books')}
				class={cc(
					'font-medium transition-colors hover:text-white',
					page.url.pathname.startsWith('/books') ? 'text-white' : 'text-neutral-400'
				)}
			>
				Bibliotèk
			</a>
			<!-- {/each} -->
		</div>
	</div>
</nav>

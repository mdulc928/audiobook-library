<script lang="ts">
	import { page } from '$app/state';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import { resolve } from '$app/paths';

	let { class: customClasses = '' } = $props();

	const links = [{ href: resolve('/books'), label: 'Bibliotèk' }];
</script>

<nav class={cc('sticky top-0 z-40 w-full backdrop-blur-sm', customClasses)}>
	<div class="mx-auto flex h-14 items-center justify-between px-4">
		<a
			href={resolve('/books')}
			class="text-lg font-bold tracking-tight text-white hover:text-white/80"
		>
			Kreyòl Pale
		</a>

		<div class="flex items-center gap-6">
			{#each links as link}
				<a
					href={link.href}
					class={cc(
						'font-medium transition-colors hover:text-white',
						page.url.pathname.startsWith(link.href) ? 'text-white' : 'text-neutral-400'
					)}
				>
					{link.label}
				</a>
			{/each}
		</div>
	</div>
</nav>

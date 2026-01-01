<script lang="ts">
	import { page } from '$app/state';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let { class: customClasses = '' } = $props();

	const links = [{ href: '/books', label: 'Library' }];
</script>

<nav
	class={cc(
		'fixed top-0 right-0 left-0 z-40 w-full border-b border-white/5 bg-stone-900/60 backdrop-blur-xl',
		customClasses
	)}
>
	<div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
		<a href="/books" class="text-lg font-bold tracking-tight text-white hover:text-white/80">
			Enegma
		</a>

		<div class="flex items-center gap-6">
			{#each links as link}
				<a
					href={link.href}
					class={cc(
						'text-sm font-medium transition-colors hover:text-white',
						page.url.pathname.startsWith(link.href) ? 'text-white' : 'text-neutral-400'
					)}
				>
					{link.label}
				</a>
			{/each}
		</div>
	</div>
</nav>

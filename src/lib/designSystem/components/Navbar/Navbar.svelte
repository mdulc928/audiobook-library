<script lang="ts">
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import { resolve } from '$app/paths';
	import HouseIcon from '$lib/designSystem/icons/HouseIcon.svelte';
	import Dropdown from '../DropdownMenu/Dropdown.svelte';
	import { getLocale, setLocale } from '$lib/paraglide/runtime';
	import ChevronDownIcon from '$lib/designSystem/icons/ChevronDownIcon.svelte';

	let { class: customClasses = '' } = $props();

	type Language = { value: 'en' | 'ht-ht'; label: string };
	const items: Language[] = [
		{ value: 'en', label: 'English' },
		{ value: 'ht-ht', label: 'Kreyòl' }
	];

	let selected = $state(items.find((i) => i.value === getLocale()) ?? items[0]);
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
			<Dropdown
				{items}
				bind:selected
				onSelect={(item) => setLocale(item.value)}
				getOptionLabel={(item) => item.label}
				getOptionValue={(item) => item.value}
				align="end"
				triggerClass="w-auto rounded-full dark:bg-white dark:text-black border-none ring-0 focus:ring-0 dark:border-none dark:hover:bg-gray-50 bg-black text-white hover:bg-gray-50 dark:hover:bg-gray-50"
				contentClass="ring-0 border-0 outline-none"
				itemClass="ring-0 border-0 outline-none active:bg-gray-50 dark:active:bg-gray-700 active:scale-110 transition-all duration-200"
			>
				<div class="flex items-center gap-1">
					<span class="text-sm font-medium">Lang. {selected.label}</span>
					<ChevronDownIcon class="h-4 w-4" />
				</div>
			</Dropdown>
			<!-- {/each} -->
		</div>
	</div>
</nav>

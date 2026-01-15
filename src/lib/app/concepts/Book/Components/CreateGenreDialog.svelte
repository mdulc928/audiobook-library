<script lang="ts">
	import { Dialog } from 'bits-ui';

	import Input from '$lib/designSystem/components/Input/Input.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import { m } from '$lib/paraglide/messages.js';

	let {
		open = $bindable(false),
		onConfirm,
		initialName = '',
		initialLocale = 'en'
	}: {
		open: boolean;
		onConfirm: (data: { en?: string; ht: string }) => void;
		initialName?: string;
		initialLocale?: 'en' | 'ht-ht';
	} = $props();

	let nameEn = $state('');
	let nameHt = $state('');

	$effect(() => {
		if (open) {
			if (initialLocale === 'en') {
				nameEn = initialName;
				nameHt = '';
			} else {
				nameHt = initialName;
				nameEn = '';
			}
		}
	});

	let isValid = $derived.by(() => {
		// Rule: If English provided, Kreyòl is required.
		// If only Kreyòl provided, that's fine.
		if (nameEn && !nameHt) return false;
		if (!nameEn && !nameHt) return false;
		return true;
	});

	function handleConfirm() {
		if (!isValid) return;
		onConfirm({
			en: nameEn || undefined,
			ht: nameHt
		});
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] bg-card text-card-foreground fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border p-6 shadow-lg duration-200 md:w-full"
		>
			<Dialog.Title class="text-lg leading-none font-semibold tracking-tight">
				Create New Genre / Kreye Nouvo Stil
			</Dialog.Title>
			<div class="grid gap-4 py-4">
				<div class="flex flex-col gap-2">
					<label for="name-en" class="text-sm font-medium">English Name (Optional)</label>
					<Input id="name-en" placeholder="e.g. Fantasy" bind:value={nameEn} />
				</div>
				<div class="flex flex-col gap-2">
					<label for="name-ht" class="text-sm font-medium">Non Kreyòl (Obligatwa)</label>
					<Input id="name-ht" placeholder="e.g. Fantazi" bind:value={nameHt} />
					{#if nameEn && !nameHt}
						<p class="text-xs text-red-500">
							Kreyòl translation is required if English name is provided.
						</p>
					{/if}
				</div>
			</div>
			<div class="flex justify-end gap-3">
				<Button variant="secondary" onclick={() => (open = false)}>{m.cancel()}</Button>
				<Button disabled={!isValid} onclick={handleConfirm}>{m.create()}</Button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

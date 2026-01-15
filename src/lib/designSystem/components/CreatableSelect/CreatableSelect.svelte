<script lang="ts" generics="T">
	import { Popover } from 'bits-ui';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import Input from '$lib/designSystem/components/Input/Input.svelte';
	import { m } from '$lib/paraglide/messages.js';

	let {
		options = $bindable([]),
		value = $bindable(),
		placeholder = m.select_placeholder(),
		multiple = false,
		class: className,
		onCreate,
		getOptionLabel = (opt: unknown) => String(opt),
		getOptionValue = (opt: unknown) => String(opt)
	}: {
		options: T[];
		value: T | T[] | undefined;
		placeholder?: string;
		multiple?: boolean;
		class?: string;
		onCreate?: (val: string) => void;
		getOptionLabel?: (opt: T) => string;
		getOptionValue?: (opt: T) => string;
	} = $props();

	let isOpen = $state(false);
	let inputValue = $state('');

	const filteredOptions = $derived(
		options.filter((opt) => getOptionLabel(opt).toLowerCase().includes(inputValue.toLowerCase()))
	);

	function handleCreate() {
		if (inputValue && onCreate) {
			onCreate(inputValue);
			// Note: We don't auto-add to options here anymore if T is complex;
			// the parent should handle updating 'options' if needed, or we rely on onCreate side effects.
			// But for backward compat or simple strings, we might want to check.
			// For generic usage, it's safer to let parent handle 'options' update.
			inputValue = '';
			// We keep the popover open? Or close? Original closed relative to selection logic.
			// If we want to simulate selection of the newly created item, parent must update 'value' too.
			isOpen = false;
		}
	}

	function isSelected(opt: T) {
		const optVal = getOptionValue(opt);
		if (Array.isArray(value)) {
			return value.some((v) => getOptionValue(v) === optVal);
		}
		return value ? getOptionValue(value) === optVal : false;
	}

	function handleSelect(opt: T) {
		if (multiple) {
			if (Array.isArray(value)) {
				if (isSelected(opt)) {
					// Remove
					value = value.filter((v) => getOptionValue(v) !== getOptionValue(opt));
				} else {
					// Add
					value = [...value, opt];
				}
			} else {
				// Initialize array
				value = [opt];
			}
		} else {
			// Single select
			value = opt;
			isOpen = false;
		}
	}

	function removeValue(val: T) {
		if (Array.isArray(value)) {
			const removeId = getOptionValue(val);
			value = value.filter((v) => getOptionValue(v) !== removeId);
		} else {
			value = undefined;
		}
	}
</script>

<div class="relative w-full">
	<Popover.Root bind:open={isOpen}>
		<Popover.Trigger class="w-full">
			<div
				class={cc(
					'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[40px] w-full flex-wrap gap-1 rounded-md border bg-bg px-3 py-2 text-sm ring-offset-bg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
			>
				{#if multiple && Array.isArray(value) && value.length > 0}
					{#each value as val, index (index)}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-text"
						>
							{getOptionLabel(val)}
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									removeValue(val);
								}}
								class="ml-1 rounded-full ring-offset-1 outline-none hover:text-primary-hover focus:text-primary-focus focus:ring-1 focus:ring-current"
							>
								×
							</button>
						</span>
					{/each}
				{:else if !multiple && value}
					<span>{getOptionLabel(value as T)}</span>
				{:else}
					<span class="text-muted-foreground">{placeholder}</span>
				{/if}
			</div>
		</Popover.Trigger>
		<Popover.Content
			class="shadow-popover bg-popover text-popover-foreground z-50 w-(--bits-popover-anchor-width) rounded-md border p-1 ring-1 ring-border outline-none"
			sideOffset={4}
		>
			<div class="mb-2 p-1">
				<Input
					placeholder={m.search_or_create_placeholder()}
					bind:value={inputValue}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							handleCreate();
						}
					}}
				/>
			</div>
			<div class="max-h-60 overflow-y-auto">
				{#each filteredOptions as option, index (index)}
					<button
						class={cc(
							'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pr-2 pl-2 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50',
							isSelected(option) ? 'bg-accent text-accent-foreground' : ''
						)}
						onclick={() => handleSelect(option)}
					>
						{getOptionLabel(option)}
						{#if isSelected(option)}
							<span class="ml-auto">✓</span>
						{/if}
					</button>
				{/each}

				<!-- Create Option -->
				<!-- Show create option if input text doesn't match any existing option label exactly -->
				{#if inputValue && !filteredOptions.some((opt) => getOptionLabel(opt).toLowerCase() === inputValue.toLowerCase())}
					<button
						class="relative flex w-full cursor-pointer items-center justify-center rounded-sm py-1.5 pr-2 pl-2 text-sm font-medium text-primary outline-none select-none hover:bg-muted focus:bg-muted"
						onclick={handleCreate}
					>
						{m.create_action({ value: inputValue })}
					</button>
				{/if}
				{#if filteredOptions.length === 0 && !inputValue}
					<div class="text-muted-foreground py-2 text-center text-sm">{m.no_options()}</div>
				{/if}
			</div>
		</Popover.Content>
	</Popover.Root>
</div>

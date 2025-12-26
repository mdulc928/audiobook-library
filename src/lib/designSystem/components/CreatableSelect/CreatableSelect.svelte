<script lang="ts">
	import { Popover } from 'bits-ui';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import Input from '$lib/designSystem/components/Input/Input.svelte';

	let {
		options = $bindable([]),
		value = $bindable(),
		placeholder = 'Select...',
		multiple = false,
		class: className,
		onCreate
	}: {
		options: string[];
		value: string | string[];
		placeholder?: string;
		multiple?: boolean;
		class?: string;
		onCreate?: (val: string) => void;
	} = $props();

	let isOpen = $state(false);
	let inputValue = $state('');

	const filteredOptions = $derived(
		options.filter((opt) => opt.toLowerCase().includes(inputValue.toLowerCase()))
	);

	function handleCreate() {
		if (inputValue && onCreate) {
			onCreate(inputValue);
			if (!options.includes(inputValue)) {
				options = [...options, inputValue];
			}
			handleSelect(inputValue);
			inputValue = '';
		}
	}

	function handleSelect(opt: string) {
		if (multiple) {
			if (Array.isArray(value)) {
				if (value.includes(opt)) {
					value = value.filter((v) => v !== opt);
				} else {
					value = [...value, opt];
				}
			} else {
				value = [opt];
			}
		} else {
			// @ts-ignore
			value = opt;
			isOpen = false;
		}
	}

	function removeValue(val: string) {
		if (Array.isArray(value)) {
			value = value.filter((v) => v !== val);
		} else {
			// @ts-ignore
			value = '';
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
					{#each value as val}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-text"
						>
							{val}
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
					<span>{value}</span>
				{:else}
					<span class="text-muted-foreground">{placeholder}</span>
				{/if}
			</div>
		</Popover.Trigger>
		<Popover.Content
			class="shadow-popover z-50 w-(--bits-popover-anchor-width) rounded-md border bg-bg p-1 text-fg ring-1 ring-border outline-none"
			sideOffset={4}
		>
			<div class="mb-2 p-1">
				<Input
					placeholder="Search or create..."
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
				{#each filteredOptions as option}
					<button
						class={cc(
							'relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pr-2 pl-2 text-sm outline-none select-none hover:bg-muted focus:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50',
							(multiple && Array.isArray(value) && value.includes(option)) ||
								(!multiple && value === option)
								? 'bg-muted'
								: ''
						)}
						onclick={() => handleSelect(option)}
					>
						{option}
						{#if (multiple && Array.isArray(value) && value.includes(option)) || (!multiple && value === option)}
							<span class="ml-auto">✓</span>
						{/if}
					</button>
				{/each}
				{#if inputValue && !filteredOptions.includes(inputValue)}
					<button
						class="relative flex w-full cursor-pointer items-center justify-center rounded-sm py-1.5 pr-2 pl-2 text-sm font-medium text-primary outline-none select-none hover:bg-muted focus:bg-muted"
						onclick={handleCreate}
					>
						Create "{inputValue}"
					</button>
				{/if}
				{#if filteredOptions.length === 0 && !inputValue}
					<div class="text-muted-foreground py-2 text-center text-sm">No options</div>
				{/if}
			</div>
		</Popover.Content>
	</Popover.Root>
</div>

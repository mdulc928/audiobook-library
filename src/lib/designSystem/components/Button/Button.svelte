<script lang="ts">
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	let {
		children,
		variant = 'primary',
		size = 'medium',
		disabled = false,
		onclick,
		class: customClasses
	}: {
		children?: Snippet<[]>;
		variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary';
		size?: 'small' | 'medium' | 'large';
		disabled?: boolean;
	} & HTMLButtonAttributes = $props();
</script>

<button
	class={cc(
		'flex items-center justify-center rounded-full bg-primary px-4 py-2 text-primary-text hover:bg-primary-hover focus:bg-primary-focus active:bg-primary-active disabled:bg-primary-disabled',
		variant === 'primary' &&
			'bg-primary text-primary-text hover:bg-primary-hover focus:bg-primary-focus active:bg-primary-active disabled:bg-primary-disabled',
		variant === 'secondary' &&
			'bg-secondary text-secondary-text hover:bg-secondary-hover focus:bg-secondary-focus active:bg-secondary-active disabled:bg-secondary-disabled',
		variant === 'tertiary' &&
			'bg-tertiary text-tertiary-text hover:bg-tertiary-hover focus:bg-tertiary-focus active:bg-tertiary-active disabled:bg-tertiary-disabled',
		variant === 'quaternary' &&
			'bg-quaternary text-quaternary-text hover:bg-quaternary-hover focus:bg-quaternary-focus active:bg-quaternary-active disabled:bg-quaternary-disabled',
		variant === 'quinary' &&
			'bg-quinary text-quinary-text hover:bg-quinary-hover focus:bg-quinary-focus active:bg-quinary-active disabled:bg-quinary-disabled',
		size === 'small' && 'px-2 py-1 text-sm',
		size === 'medium' && 'px-4 py-2 text-base',
		size === 'large' && 'px-6 py-3 text-lg',
		disabled && 'cursor-not-allowed opacity-50',
		customClasses
	)}
	{disabled}
	{onclick}
>
	{@render children?.()}
</button>

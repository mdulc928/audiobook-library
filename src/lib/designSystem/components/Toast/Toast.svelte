<script lang="ts">
	import { Portal } from 'bits-ui';
	import { toast } from './toastManager.svelte';
	import { fly } from 'svelte/transition';
	import CheckIcon from '$lib/designSystem/icons/CheckIcon.svelte';
	import UnverifiedIcon from '$lib/designSystem/icons/UnverifiedIcon.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
</script>

<Portal>
	<div
		class="pointer-events-none fixed right-0 bottom-0 z-100 flex max-h-screen w-full flex-col justify-end gap-2 p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]"
	>
		{#each toast.toasts as t (t.id)}
			<div
				class={cc(
					'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all',
					// Default / Info
					'border-zinc-200 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
					// Variations
					t.type === 'success' &&
						'border-green-500/50 bg-green-50 dark:bg-green-900/10 dark:text-green-50',
					t.type === 'error' && 'border-red-500/50 bg-red-50 dark:bg-red-900/10 dark:text-red-50',
					t.type === 'warning' &&
						'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10 dark:text-yellow-50'
				)}
				transition:fly={{ y: 20, duration: 300 }}
			>
				<div class="flex w-full gap-3">
					{#if t.type === 'success'}
						<CheckIcon class="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
					{:else if t.type === 'error'}
						<UnverifiedIcon class="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
					{:else if t.type === 'warning'}
						<UnverifiedIcon class="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
					{/if}

					<div class="grid flex-1 gap-1">
						{#if t.title}
							<h3 class="leading-none font-semibold tracking-tight">{t.title}</h3>
						{/if}
						{#if t.message}
							<div class="text-sm break-words opacity-90">{t.message}</div>
						{/if}
					</div>
				</div>

				{#if t.dismissible}
					<button
						type="button"
						class={cc(
							'absolute top-2 right-2 rounded-md p-1 opacity-50 transition-opacity group-hover:opacity-100 hover:opacity-100 focus:opacity-100 focus:ring-1 focus:outline-none',
							t.type === 'success'
								? 'text-green-900 focus:ring-green-900 dark:text-green-50 dark:focus:ring-green-50'
								: t.type === 'error'
									? 'text-red-900 focus:ring-red-900 dark:text-red-50 dark:focus:ring-red-50'
									: 'text-zinc-950 focus:ring-zinc-950 dark:text-zinc-50 dark:focus:ring-zinc-50'
						)}
						onclick={() => toast.remove(t.id)}
					>
						<span class="sr-only">Close</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4"
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</button>
				{/if}
			</div>
		{/each}
	</div>
</Portal>

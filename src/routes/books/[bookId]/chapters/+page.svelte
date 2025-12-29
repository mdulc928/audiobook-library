<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	// Redirect to the book page
	const bookId = page.params.bookId;
	goto(resolve(`/books/${bookId}`), { replaceState: true });
</script>

<!-- Placeholder while redirecting -->
<div class="flex h-full w-full items-center justify-center bg-background">
	<p class="text-muted-foreground">Redirecting...</p>
</div>

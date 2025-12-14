<script lang="ts">
	import firstAudio from '$lib/assets/bookExamples/UpTrack.m4a';

	import firstImage from '$lib/assets/bookExamples/f55d1d7a-9be4-4a78-b243-20167e7273c7.png';
	import secondImage from '$lib/assets/bookExamples/ec746424-ac5b-4572-adae-5b1be3310869_hd.mp4';

	import { Subtitle, Chapter, BookImage } from './Book.svelte';
	import ChapterAudioPlayer from './ChapterAudioPlayer.svelte';

	let chapter = new Chapter({
		id: 'nice',
		title: 'A Really Nice Book',
		subtitles: [
			new Subtitle({
				timestamp: 0,
				duration: 1,
				text: 'This is first subtitle'
			}),
			new Subtitle({
				timestamp: 1,
				duration: 1,
				text: 'This is second subtitle'
			}),
			new Subtitle({
				timestamp: 2,
				duration: 1,
				text: 'This is third subtitle'
			})
		],
		audioSrc: firstAudio,
		duration: 3,
		images: [
			new BookImage({
				imageLink: firstImage,
				timestamp: 0,
				duration: 1
			}),
			new BookImage({
				imageLink: secondImage,
				timestamp: 1,
				duration: 1
			})
		]
	});
</script>

<div>
	<ChapterAudioPlayer {chapter} />
</div>

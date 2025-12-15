<script lang="ts">
	import { Chapter, Subtitle, BookImage, Book } from './Book.svelte';
	import upTrackAudio from '$lib/assets/bookExamples/UpTrack.m4a';
	import phoneVibrationAudio from '$lib/assets/bookExamples/phone-vibration-96623.mp3';
	import waymoAudio from '$lib/assets/bookExamples/waymo (audio-extractor.net) copy.mp3';
	import bookImage from '$lib/assets/bookExamples/f55d1d7a-9be4-4a78-b243-20167e7273c7.png';
	import ChapterView from './ChapterView.svelte';
	import Heading from '$lib/designSystem/components/Heading/Heading.svelte';

	let {} = $props();
	const chapter1 = new Chapter({
		id: 'chapter-1',
		title: 'The Beginning of an Adventure',
		subtitles: [
			new Subtitle({
				timestamp: 0,
				duration: 3,
				text: 'In a world where magic flows through every stream and whispers in the wind...'
			}),
			new Subtitle({
				timestamp: 3,
				duration: 4,
				text: 'Our hero stood at the edge of the ancient forest, ready to embark on a journey that would change everything.'
			}),
			new Subtitle({
				timestamp: 7,
				duration: 3,
				text: 'The old map crinkled in their hands as they took the first step forward.'
			}),
			new Subtitle({
				timestamp: 10,
				duration: 2,
				text: 'Little did they know what awaited them beyond the trees.'
			})
		],
		audioSrc: upTrackAudio,
		duration: 12,
		images: [
			new BookImage({
				imageLink: bookImage,
				timestamp: 0,
				duration: 6
			}),
			new BookImage({
				imageLink: bookImage,
				timestamp: 6,
				duration: 6
			})
		]
	});

	const chapter2 = new Chapter({
		id: 'chapter-2',
		title: 'The Mysterious Stranger',
		subtitles: [
			new Subtitle({
				timestamp: 0,
				duration: 3,
				text: 'As the sun began to set, a figure emerged from the shadows.'
			}),
			new Subtitle({
				timestamp: 3,
				duration: 4,
				text: 'Their cloak was tattered, but their eyes held a wisdom that spoke of many journeys.'
			}),
			new Subtitle({
				timestamp: 7,
				duration: 3,
				text: '"You seek the ancient artifact," they said, their voice like rustling leaves.'
			}),
			new Subtitle({
				timestamp: 10,
				duration: 2,
				text: '"But beware, for the path is treacherous and filled with trials."'
			})
		],
		audioSrc: phoneVibrationAudio,
		duration: 12,
		images: [
			new BookImage({
				imageLink: bookImage,
				timestamp: 0,
				duration: 12
			})
		]
	});

	const chapter3 = new Chapter({
		id: 'chapter-3',
		title: 'The First Trial',
		subtitles: [
			new Subtitle({
				timestamp: 0,
				duration: 3,
				text: 'The ancient temple loomed before them, its stone walls covered in mysterious runes.'
			}),
			new Subtitle({
				timestamp: 3,
				duration: 4,
				text: 'Each step echoed through the vast chamber as they approached the first challenge.'
			}),
			new Subtitle({
				timestamp: 7,
				duration: 3,
				text: 'Three doors stood before them, each marked with a different symbol.'
			}),
			new Subtitle({
				timestamp: 10,
				duration: 2,
				text: 'Which path would they choose?'
			})
		],
		audioSrc: waymoAudio,
		duration: 12,
		images: [
			new BookImage({
				imageLink: bookImage,
				timestamp: 0,
				duration: 6
			}),
			new BookImage({
				imageLink: bookImage,
				timestamp: 6,
				duration: 6
			})
		]
	});

	const chapter4 = new Chapter({
		id: 'chapter-4',
		title: 'The Hidden Library',
		subtitles: [
			new Subtitle({
				timestamp: 0,
				duration: 3,
				text: 'Behind the chosen door lay a library that seemed to stretch into infinity.'
			}),
			new Subtitle({
				timestamp: 3,
				duration: 4,
				text: 'Books floated through the air, their pages turning of their own accord.'
			}),
			new Subtitle({
				timestamp: 7,
				duration: 3,
				text: 'In the center, an ancient tome glowed with an ethereal light.'
			}),
			new Subtitle({
				timestamp: 10,
				duration: 2,
				text: 'This was the knowledge they had been seeking all along.'
			})
		],
		audioSrc: upTrackAudio,
		duration: 12,
		images: [
			new BookImage({
				imageLink: bookImage,
				timestamp: 0,
				duration: 12
			})
		]
	});

	const chapter5 = new Chapter({
		id: 'chapter-5',
		title: 'The Final Confrontation',
		subtitles: [
			new Subtitle({
				timestamp: 0,
				duration: 3,
				text: 'The artifact pulsed with power in their hands as they faced the guardian.'
			}),
			new Subtitle({
				timestamp: 3,
				duration: 4,
				text: 'Ancient magic crackled through the air, and the very ground trembled beneath their feet.'
			}),
			new Subtitle({
				timestamp: 7,
				duration: 3,
				text: "With courage and wisdom, they channeled the artifact's power."
			}),
			new Subtitle({
				timestamp: 10,
				duration: 2,
				text: 'And in that moment, everything changed.'
			})
		],
		audioSrc: phoneVibrationAudio,
		duration: 12,
		images: [
			new BookImage({
				imageLink: bookImage,
				timestamp: 0,
				duration: 6
			}),
			new BookImage({
				imageLink: bookImage,
				timestamp: 6,
				duration: 6
			})
		]
	});

	const chapters = [chapter1, chapter2, chapter3, chapter4, chapter5];
	const totalDuration = chapters.reduce((sum, ch) => sum + (ch.duration ?? 0), 0);

	let book = $state(
		new Book({
			id: 'book-001',
			chapters: chapters,
			title: 'The Chronicles of the Ancient Artifact',
			author: ['Elena Moonwhisper', 'Marcus Starweaver'],
			cover: new BookImage({ imageLink: bookImage }),
			duration: totalDuration
		})
	);
</script>

<div class="flex flex-col">
	<div class="flex flex-col gap-2 px-2 pb-4">
		<Heading>{book.title}</Heading>
		{book.author}
		<span class="text-sm text-gray-500">{book.duration} minutes</span>
	</div>
	<div class="flex flex-col gap-2.5">
		{#each book.chapters as chapter}
			<ChapterView {chapter} />
		{/each}
	</div>
</div>

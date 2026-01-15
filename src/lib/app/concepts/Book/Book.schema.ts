import { z } from 'zod';

// Schema for BookImage
export const bookImageSchema = z.object({
	id: z.string().optional(),
	imageLink: z.string().optional(),
	timestamp: z.number().optional(),
	duration: z.number().optional()
});

// Schema for Subtitle
export const subtitleSchema = z.object({
	id: z.string().optional(),
	timestamp: z.number().optional(),
	duration: z.number().optional(),
	text: z.string().optional()
});

// Schema for Chapter
export const chapterSchema = z.object({
	id: z.string().optional(),
	title: z.string().optional(),
	audioSrc: z.string().optional(),
	duration: z.number().optional(),
	images: z.array(bookImageSchema).optional(),
	subtitles: z.array(subtitleSchema).optional()
});

// Schema for Genre
// Schema for Genre
export const genreSchema = z.object({
	id: z.string().optional(),
	name: z
		.union([z.record(z.string(), z.string()), z.string()])
		.transform((val) => (typeof val === 'string' ? { en: val } : val))
		.optional()
});

export const topicSchema = z.object({
	id: z.string().optional(),
	name: z
		.union([z.record(z.string(), z.string()), z.string()])
		.transform((val) => (typeof val === 'string' ? { en: val } : val))
		.optional()
});

export const tagSchema = z.object({
	id: z.string().optional(),
	name: z
		.union([z.record(z.string(), z.string()), z.string()])
		.transform((val) => (typeof val === 'string' ? { en: val } : val))
		.optional()
});

export const languageSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional()
});

export const MoodSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional()
});

// Schema for Author
export const authorSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional()
});

// Schema for Book
export const bookSchema = z.object({
	id: z.string().optional(),
	title: z.string().optional(),
	author: z.array(z.string()).optional(), // the id of the author
	genres: z.array(z.string()).optional(), // the id of the genre
	topics: z.array(z.string()).optional(), // the id of the topic
	tags: z.array(z.string()).optional(), // the id of the tag
	moods: z.array(z.string()).optional(), // the id of the mood
	language: z.string().optional(), // the id of the language
	chapters: z.array(chapterSchema).optional(),
	cover: bookImageSchema.optional(),
	duration: z.number().optional(),
	description: z.string().optional()
});

// Schema for API responses
export const bookResponseSchema = bookSchema;
export const booksResponseSchema = z.array(bookSchema);

// Type exports
export type BookData = z.infer<typeof bookSchema>;
export type ChapterData = z.infer<typeof chapterSchema>;
export type BookImageData = z.infer<typeof bookImageSchema>;
export type SubtitleData = z.infer<typeof subtitleSchema>;
export type GenreData = z.infer<typeof genreSchema>;
export type TopicData = z.infer<typeof topicSchema>;
export type TagData = z.infer<typeof tagSchema>;
export type LanguageData = z.infer<typeof languageSchema>;
export type MoodData = z.infer<typeof MoodSchema>;
export type AuthorData = z.infer<typeof authorSchema>;
export type BookResponseData = z.infer<typeof bookResponseSchema>;
export type BooksResponseData = z.infer<typeof booksResponseSchema>;

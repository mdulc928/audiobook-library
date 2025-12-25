import { z } from 'zod';

// Schema for BookImage
export const BookImageSchema = z.object({
	imageLink: z.string().optional(),
	timestamp: z.number().optional(),
	duration: z.number().optional()
});

// Schema for Subtitle
export const SubtitleSchema = z.object({
	timestamp: z.number().optional(),
	duration: z.number().optional(),
	text: z.string().optional()
});

// Schema for Chapter
export const ChapterSchema = z.object({
	id: z.string().optional(),
	title: z.string().optional(),
	audioSrc: z.string().optional(),
	duration: z.number().optional(),
	length: z.number().optional(), // Handle potential alias from POJO
	images: z.array(BookImageSchema).optional(),
	subtitles: z.array(SubtitleSchema).optional()
});

// Schema for Book
export const BookSchema = z.object({
	id: z.string().optional(),
	title: z.string().optional(),
	author: z.array(z.string()).optional(),
	chapters: z.array(ChapterSchema).optional(),
	cover: BookImageSchema.optional(),
	duration: z.number().optional()
});

// Schema for API responses
export const BookResponseSchema = BookSchema;
export const BooksResponseSchema = z.array(BookSchema);

// Type exports
export type BookData = z.infer<typeof BookSchema>;
export type ChapterData = z.infer<typeof ChapterSchema>;
export type BookImageData = z.infer<typeof BookImageSchema>;
export type SubtitleData = z.infer<typeof SubtitleSchema>;

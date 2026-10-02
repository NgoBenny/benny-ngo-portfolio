import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    subtitle: z.string(),
    summary: z.string(),
    order: z.number(),
    category: z.string(),
    period: z.string(),
    technologies: z.array(z.string()),
    thumbnail: image(),
    thumbnailAlt: z.string(),
    caption: z.string(),
    sourceVisibility: z.enum(['public', 'private']),
    repositoryUrl: z.url().optional(),
    demoUrl: z.url().optional(),
    highlights: z.array(z.object({ value: z.string(), label: z.string() })),
    architecture: z.array(z.object({ title: z.string(), detail: z.string() })),
  }).refine((project) => project.sourceVisibility !== 'private' || !project.repositoryUrl, {
    message: 'Private project source must not have a public repository button.',
  }),
});
export const collections = { projects };

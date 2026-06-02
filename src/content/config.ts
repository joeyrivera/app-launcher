import { defineCollection, z } from 'astro:content';

// The contract: adding an app = adding one .mdx file in src/content/apps/.
// All frontmatter is validated at build time, so a typo or missing field
// fails the build instead of shipping broken to production.
const apps = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    // Optional: when absent the tile shows a "Not publicly hosted" badge
    // instead of a Launch button (e.g. forex daemon, lottery).
    liveUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
    tech: z.array(z.string()).default([]),
    // Optional hero image; falls back to a generated monogram tile.
    screenshot: z.string().optional(),
    icon: z.string().optional(),
    // Per-app accent color (hex) drives the tile glow/gradient.
    accent: z.string().default('#6366f1'),
    status: z.enum(['live', 'wip', 'archived']).default('wip'),
    featured: z.boolean().default(false),
    order: z.number().optional(),
    // Which grid the app belongs to: the owner's apps ("mine", default) or
    // the "My kids' apps" section at the bottom.
    section: z.enum(['mine', 'kids']).default('mine'),
  }),
});

export const collections = { apps };

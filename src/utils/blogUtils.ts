import type { CollectionEntry } from 'astro:content';

// Function to get sorted posts by date
export const getSortedPosts = (posts: CollectionEntry<'blog'>[]) => {
  return posts.sort(
    (a, b) =>
      Math.floor(new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000) -
      Math.floor(new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000)
  );
};

// Utility to resolve a cover image path for a blog post without frontmatter
// Looks for common filenames within the post's directory
const IMAGE_GLOB = import.meta.glob('src/**/*.{jpeg,jpg,png,gif,webp}');
const CANDIDATE_BASENAMES = ['cover', 'og'];
const CANDIDATE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

/**
 * Given a blog post id from content collections, find a matching cover image path
 * next to the post file, using common filenames and extensions.
 * Returns a path like "/src/content/blog/my-post/cover.png" if found; otherwise undefined.
 */
export async function resolveCoverImagePathFromId(postId: string): Promise<string | undefined> {
  // postId looks like "my-post/index" or "category/my-post/index" depending on structure
  const slug = postId;
  const baseDir = `/src/content/blog/${slug}`;

  for (const name of CANDIDATE_BASENAMES) {
    for (const ext of CANDIDATE_EXTENSIONS) {
      const candidate = `${baseDir}/${name}.${ext}`;
      // Keys of IMAGE_GLOB match the pattern used in importImage.ts (starting with /src)
      if (candidate in IMAGE_GLOB) {
        return candidate;
      }
    }
  }

  return undefined;
}

export const generateSlug = (post: CollectionEntry<'blog'>): string => {
  // 1. If frontmatter has slug, use it
  if (post.data.slug) {
    return post.data.slug;
  }

  // 2. Check if post id begins with a date pattern (YYYY-MM-DD-)
  const datePattern = /^\d{4}-\d{2}-\d{2}-/;
  if (datePattern.test(post.id)) {
    return post.id.replace(datePattern, '');
  }

  // 3. Otherwise, use the post id as is
  return post.id;
};

export const slugify = (string: string) => {
  return string
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

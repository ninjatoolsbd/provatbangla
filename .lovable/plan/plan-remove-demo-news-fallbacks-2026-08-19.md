# Plan: Remove Demo News Fallbacks

The application currently fallbacks to demo news data (from `src/lib/news-data.ts`) when the database (Supabase) is unavailable or empty. This was implemented to prevent a blank page in environments where secrets were not yet configured. The user now wants to remove these fallbacks and see only actual news.

## Proposed Changes

### 1. Cleanup Data Fetching Functions
- Modify `src/lib/posts.ts`: Remove the demo data fallback in `fetchPublishedPosts`.
- Modify `src/lib/public-posts.functions.ts`: Ensure server functions return empty results or proper errors instead of falling back to demo logic if any was remaining (already mostly clean but will double-check).

### 2. Update Components
- Modify `src/components/latest-posts.tsx`: Remove `fetchFilteredPosts` demo fallback.
- Modify `src/components/home-section.tsx`: Remove `useQuery` demo fallback in `HomeSection`.
- Modify `src/routes/index.tsx`: Remove manual demo data construction for `videoPosts` and `photoPosts`.
- Modify `src/routes/post.$slug.tsx`: Remove the `loader` logic that checks for `demo-` prefix or falls back to demo articles when a post is not found.

### 3. Cleanup Layout Fallbacks
- Modify `src/components/home-widgets.tsx`: Remove any hardcoded demo strings or images in widgets like `PollWidget` or `EpaperCard` if they reference demo-only assets.

## Technical Details
- The `src/lib/news-data.ts` file will remain in the codebase as a reference but will no longer be imported by active components or functions.
- If the database is empty, the sections will now render empty states (or nothing) as per standard behavior, instead of showing "ব্যাংকিং খাতে বিশাল নিয়োগ" etc.

## Verification Plan
- Check the home page to ensure no demo articles are visible.
- Check a post page with a non-existent slug to ensure it correctly returns a 404 instead of a demo post.
- Verify build success.

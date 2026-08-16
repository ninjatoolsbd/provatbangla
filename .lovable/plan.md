# Plan: Fix News Detail Page Layout and Social Sharing

The user reported issues on the news detail page: social sharing buttons are not functional, and the sidebar is too wide, taking up space from the main news content.

## User Preferences
- **Layout**: The news content should take more space, and the sidebar (right column) should be narrower/thinner.
- **Functionality**: Social share buttons (Facebook, Twitter, Link) must work.
- **Visuals**: No other visual modifications unless specified.

## Proposed Changes

### 1. Update Layout in `src/routes/news.$id.tsx`
- Change grid column distribution from `lg:grid-cols-12` with `lg:col-span-8` (main) and `lg:col-span-4` (sidebar) to a more balanced ratio.
- New distribution: `lg:col-span-9` for the main content and `lg:col-span-3` for the sidebar.
- Adjust max-width of the main container if necessary to ensure readability while giving more space to news.

### 2. Implement Social Sharing Functionality
- Add logic to the Facebook, Twitter, and Link buttons to share the current URL.
- Use `window.open` for Facebook and Twitter sharing.
- Use `navigator.clipboard.writeText` for the "Copy Link" button.
- Add a tooltip or notification (Sonner toast) when the link is copied.

### 3. Sidebar Refinement
- Ensure `GridCard` and other sidebar components adapt gracefully to the narrower width.
- Reduce padding/margins if needed to keep it "thinner" as requested.

## Technical Details
- **Grid Ratio**: Update `lg:col-span-8` -> `lg:col-span-9` and `lg:col-span-4` -> `lg:col-span-3`.
- **Share URLs**:
  - Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  - Twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
- **Link Copy**: Use `navigator.clipboard.writeText(window.location.href)` and show a toast.

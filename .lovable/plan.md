# Kalbela Alignment & UI Polish Plan

The user feels the site is not close enough to `kalbela.com`. This plan focuses on high-fidelity visual alignment, specifically targeting container widths, typography hierarchy, header tiering, and home section layouts to match the reference's professional look and feel.

## Visual & Layout Refinements

- **Global Container**: Standardize all containers to a strict `max-w-[1360px]` for large screens, matching Kalbela's wide layout.
- **Typography**: 
    - Display font: `Noto Serif Bengali` for all main headlines to give a premium news feel.
    - Body font: `Hind Siliguri` for all excerpts and content.
    - Article Headline (Home): Increase to `text-[42px]` for the hero post to match the visual impact.
- **Site Header**:
    - Refine the 3-tier header structure: Top bar (utility/converter), middle bar (Logo, Search, Social), and bottom bar (Main Navigation).
    - Ensure the "প্রচ্ছদ" (Home) icon is prominent and matches the reference style.
- **Home Sections**:
    - Update `HomeSection` components to use sharper borders, specific padding (`p-5`), and the signature primary-colored vertical bar in headings.
    - Implement a "National" layout variant that matches the 5-4-3 column split seen on Kalbela (Lead article, Thumb list, Text list).
- **Latest Posts Grid**:
    - Redesign the `LatestPosts` section (Sorboshesh) to exactly mirror the Kalbela grid: Large Hero on left (8 cols), Sidebar on right (4 cols) with 5 specific thumb-based list items.

## Implementation Steps

### 1. Global CSS & Theme
- Update `src/styles.css` to refine the design tokens and ensure typography weights are correctly mapped for Bengali fonts.
- Add specific utility classes for Kalbela-style borders and shadows.

### 2. Header Re-Architecture
- Modify `src/components/site-header.tsx` to strictly follow the 3-tier layout.
- Adjust logo sizing and utility link typography to be more compact and bold.

### 3. Home Layout Polish
- Update `src/routes/index.tsx` to ensure section spacing (`gap-y-10`) matches the professional density of a news portal.
- Refine `LatestPosts` in `src/components/latest-posts.tsx` to handle the grid proportions more accurately.

### 4. News Cards Fidelity
- Update `src/components/news-cards.tsx` to adjust headline sizes (`LeadCard`, `GridCard`, `ThumbRow`) to match the hierarchy of the reference site.
- Add specific hover effects (subtle scale + primary color text transition).

## Technical Details

- Use `text-slate-900` for all main headlines for better legibility against `bg-white`.
- Ensure all borders use a consistent `border-slate-200` (or `border-border` variable).
- Maintain the `oklch(0.603 0.235 27)` primary red from the Provat Bangla logo.
- Apply `leading-tight` (`leading-[1.2]`) to headlines and `leading-relaxed` (`leading-[1.7]`) to body text.

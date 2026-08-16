# Kalbela Style Alignment - Icons, Design, and Layout Refinement

This plan focuses on aligning the visual design, iconography, and layout structure of the "Provat Bangla" news portal with the `kalbela.com` reference image. It addresses missing icons, grid consistency, typography weighting, and specific widget styling.

## Proposed Changes

### 1. Global Containers & Typography
- Standardize all main containers to `max-w-[1360px]` for layout consistency.
- Refine headline font weights (switching to `font-extrabold` for major headers) and line heights to match the density of the reference site.

### 2. Header & Icons
- **Utility Bar**: Add missing icons for specific links (e.g., E-paper, Archive, Magazine) and ensure they match the slate-700/primary hover style.
- **Menu Bar**: Add a "Home" icon at the start of the category menu. Add a "Plus" or "Down Arrow" icon for the "Others" dropdown.
- **Top Bar**: Ensure the "Live TV" indicator (red dot) is prominent and pulsing.

### 3. News Grid & Section Headings
- **BarHeading**: Update the vertical primary bar to be exactly `5px` wide and match the font size of `22px` bold.
- **Grid Layouts**: Adjust the spacing between cards to `gap-6` or `gap-8` to prevent a cramped look.
- **Lead Cards**: Increase the headline size of the main hero news item to `42px` on large screens to create a stronger visual hierarchy.

### 4. Special Widgets
- **Breaking Ticker**: Refine the "সর্বশেষ" badge to be slightly taller and use a sharper font.
- **Video/Photo Gallery**: Align the "Play" and "Camera" icons to be centered on thumbnails with a semi-transparent dark overlay on hover.
- **Poll Widget**: Update the radio button styling and ensure the "Total Votes" text is correctly aligned.

### 5. Division Map & Bottom Section
- **Map Interaction**: Ensure the division map has clear hover states and labels that don't overlap.
- **Footer**: Refine the social media icons in the footer to be bordered circles/squares as per the reference image.

## Technical Details
- **Styling**: All changes will use Tailwind CSS v4 variables (e.g., `--primary`, `--font-display`) to maintain theme consistency.
- **Components**: Edits will be applied to `src/components/site-header.tsx`, `src/components/home-widgets.tsx`, `src/components/news-cards.tsx`, and `src/components/latest-posts.tsx`.
- **Assets**: Use Lucide React icons that most closely match the reference (e.g., `Newspaper`, `Tv`, `Image`, `MapPin`).

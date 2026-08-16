# UI Refinement Plan - Kalbela Style Alignment

Refining the typography, iconography, and layout to more closely match the professional aesthetics of `kalbela.com`, focusing on Bengali font hierarchy, spacing, and specific UI elements.

## Proposed Changes

### 1. Typography & Global Styles
- Update `src/styles.css` to refine font weights and line heights.
- Ensure "Hind Siliguri" is used consistently for body text and "Noto Serif Bengali" for headlines with specific weights (700-800 for main news).
- Adjust global spacing and container widths to match the 1360px layout of Kalbela.

### 2. Header & Navigation Refinement
- Update `src/components/site-header.tsx` to match the two-tier structure more precisely.
- Refine the utility nav icons and labels.
- Improve the main navigation menu hover effects and dropdown styling.
- Ensure the logo size and alignment are pixel-perfect.

### 3. Home Page & Section Layouts
- Refine `src/components/home-section.tsx` layouts (national, politics, grid).
- Update `BarHeading` in `src/components/home-widgets.tsx` to use the red vertical bar style more consistently.
- Adjust `LatestPosts` in `src/components/latest-posts.tsx` to match the hero grid precisely, including the right sidebar feed styling.

### 4. News Cards & Typography
- Update `src/components/news-cards.tsx` to refine headline sizes:
    - `LeadCard`: Larger, bolder headlines.
    - `GridCard`: Precise padding and typography.
    - `ThumbRow`: Compact yet readable.
- Add "Kicker" support where it's missing or needs better styling.

### 5. Post Page Layout
- Refine `src/routes/post.$slug.tsx` for a cleaner reading experience.
- Adjust sidebar widgets (Latest/Popular tabs) to match Kalbela's specific styling (border colors, font sizes).
- Improve social sharing icons and author meta section.

### 6. Iconography
- Standardize icon usage across the site using Lucide-React, ensuring sizes and colors match the target site's subtlety.

## Technical Details
- **Fonts**: Hind Siliguri (Body), Noto Serif Bengali (Display).
- **Colors**: Primary Red (#ED1C24), Deep Black/Slate for text.
- **Components**: Tailwind CSS v4, Lucide-React.

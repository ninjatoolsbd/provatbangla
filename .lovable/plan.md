# Responsive Design Overhaul Plan

This plan focuses on making the "প্রভাতবাংলা" news portal fully responsive across all device sizes (mobile, tablet, and desktop) without layout breaking or element overlapping.

## User Review Required

> [!IMPORTANT]
> The changes will slightly adjust font sizes and grid behaviors on smaller screens to ensure readability. No functionality will be removed.

- **Header**: Logo and menu will scale better on small devices. Scrolled header will be more compact.
- **Grids**: Multi-column grids will collapse to single columns on mobile.
- **Typography**: Bengali fonts will be optimized for small screen readability.

## Proposed Changes

### Styling & Layout Optimization
- Update `src/styles.css` with responsive utilities for Bengali typography.
- Refine global container behaviors for ultra-wide and small screens.

### Component Refinements
#### 1. Header (`src/components/site-header.tsx`)
- Adjust logo sizing logic to prevent overflow on mobile.
- Optimize the sticky header's responsive behavior.
- Ensure the mobile menu trigger is always accessible and doesn't conflict with other icons.

#### 2. Hero & Sections (`src/components/latest-posts.tsx`, `src/components/home-section.tsx`)
- Adjust `lg:grid-cols-12` layouts to ensure they gracefully degrade to `grid-cols-1` on mobile.
- Fix image aspect ratios in the Hero section for better vertical space usage on mobile.

#### 3. Ticker & Widgets (`src/components/breaking-ticker.tsx`, `src/components/bottom-widgets.tsx`)
- Ensure the news ticker remains readable and its controls don't overlap text.
- Adjust the `BottomWidgets` grid to stack vertically on smaller screens.

#### 4. Division Map (`src/components/division-map.tsx`)
- Optimize the SVG map scaling for mobile viewports.

### Verification Plan
- Use Playwright to capture screenshots at:
  - Mobile (375px)
  - Tablet (768px)
  - Desktop (1280px)
  - Large Desktop (1536px)
- Manually check for text overflow, overlapping buttons, and broken aspect ratios.

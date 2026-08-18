---
title: Link Facebook Page
details: |
  Link all Facebook icons to the official Facebook page: https://www.facebook.com/provatbanglanews

  - Update `src/components/site-header.tsx`: Link `socialGroups` Facebook items.
  - Update `src/components/site-footer.tsx`: Update `socials` array with the link.
  - Update `src/components/home-widgets.tsx`: Link items in `SocialFollow` component.
  - Update `src/components/bottom-widgets.tsx`: Update social icons in the poll section.
  - Update `src/routes/news.$id.tsx` and `src/routes/post.$slug.tsx`: Ensure follow/share icons are correctly linked where applicable.
---

# Plan - Link Facebook Page

The user wants to link all Facebook icons across the site to their official Facebook page: `https://www.facebook.com/provatbanglanews`.

## User Review Required

> [!IMPORTANT]
> This will update all Facebook icons throughout the site (header, footer, widgets, and post pages) to point to the provided URL.

## Technical Details

- **Header**: Update `socialGroups` in `src/components/site-header.tsx` to include the link for Facebook items.
- **Footer**: Update `socials` mapping in `src/components/site-footer.tsx`.
- **Widgets**:
    - Update `SocialFollow` in `src/components/home-widgets.tsx`.
    - Update poll sharing icons in `src/components/bottom-widgets.tsx`.
- **Post Pages**: Ensure any "Follow us" or static Facebook links in `src/routes/news.$id.tsx` and `src/routes/post.$slug.tsx` are updated (excluding the "Share on Facebook" functionality which dynamically generates share URLs).

## Implementation Steps

### 1. Update Site Header
- Modify `src/components/site-header.tsx` to add `href: "https://www.facebook.com/provatbanglanews"` to Facebook items in the `socialGroups` mega menu.

### 2. Update Site Footer
- Modify `src/components/site-footer.tsx` to include `href: "https://www.facebook.com/provatbanglanews"` in the `socials` array and update the JSX to use it.

### 3. Update Home Widgets
- Modify `SocialFollow` in `src/components/home-widgets.tsx` to wrap the list items in `<a>` tags pointing to the Facebook page.

### 4. Update Bottom Widgets
- Modify `BottomWidgets` in `src/components/bottom-widgets.tsx` to link the Facebook icon in the poll section.

### 5. Verification
- Verify all links in the preview across different sections (Header, Footer, Sidebars).

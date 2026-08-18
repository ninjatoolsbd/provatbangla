---
title: Replace Breaking News with Photocard Generator in Admin
description: Remove the "Breaking News" section from the admin sidebar and replace it with a dedicated "Photocard Generator" tool.
type: feature
---

## User Request
The user wants to remove the "Breaking News" (ব্রেকিং নিউজ) option from the admin dashboard and add a "Photocard Generator" (ফটোকোর্ড জেনারেটর) tool in its place.

## Technical Details
- **File to Modify**: `src/components/admin-sidebar.tsx`
- **Actions**:
    1. Remove the "ব্রেকিং নিউজ" item from the `contentItems` array.
    2. Add a new item "ফটোকোর্ড জেনারেটর" to the same array.
    3. Update the icon for the new item to something appropriate (e.g., `Image` or `Frame`).
    4. Point the URL of the new item to `/admin/photocards` (or a similar relevant route).
    5. Since a dedicated page for photocard generation might not exist yet beyond the one in `write.tsx`, I will create a new route `src/routes/admin/photocards.tsx` that provides a standalone interface for generating photocards from existing posts or custom inputs.

## Plan
1. **Remove Breaking News from Sidebar**: Update `src/components/admin-sidebar.tsx` to remove the breaking news link and add the photocard generator link.
2. **Create Standalone Photocard Generator Route**: Create `src/routes/admin/photocards.tsx` to allow admins to generate photocards without having to open the "Write News" page.
3. **Delete/Redirect Breaking News Route**: Optionally delete `src/routes/admin/breaking.tsx` if it's no longer needed, or just leave it unreachable from the menu.

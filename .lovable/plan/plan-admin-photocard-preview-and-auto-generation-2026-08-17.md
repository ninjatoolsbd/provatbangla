# Plan: Admin Photocard Preview and Auto-Generation

The user wants to see a preview of the generated photocard in the admin panel's "Write News" section (specifically in the area marked in the uploaded image) with a download button below it. Additionally, the photocard should be generated automatically as soon as an image is uploaded.

## User Requirements
- Show a small preview of the photocard in the sidebar (where the blue circle was in the image).
- Add a download button directly under this preview.
- Trigger photocard generation automatically when a featured image is uploaded.

## Technical Details
- **Location:** The sidebar of `src/routes/admin/write.tsx`, below the "Feature Image" section.
- **Auto-Generation:** Update the image upload success handler to trigger `handleGeneratePhotocard` if a title is present.
- **Preview UI:** Add a new card/section in the sidebar to display `photocardUrl` if it exists, along with a download link.

## Proposed Changes

### 1. `src/routes/admin/write.tsx`
- Add a "Photocard Preview" section in the sidebar below "Feature Image".
- Update `handleFileUpload` to optionally trigger photocard generation if `title` exists.
- Update `setImageUrl` setter calls to also consider if photocard needs regeneration.
- Ensure the photocard preview displays the generated SVG/image from R2.

### 2. Validation
- Verify that uploading an image triggers the photocard generation (if title exists).
- Verify that the preview appears in the sidebar.
- Verify that the download button works.

## Non-Technical Summary
I will add a live preview of the news photocard directly in the sidebar of the editor. Whenever you upload a featured image, the system will automatically create the photocard for you. You'll be able to see it and download it instantly without waiting for the news to be published.

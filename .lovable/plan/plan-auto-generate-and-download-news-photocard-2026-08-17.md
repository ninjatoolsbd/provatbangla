# Plan: Auto-Generate and Download News Photocard

Implement a feature that automatically generates a visual "Photocard" for a news article upon publication. The photocard will include the news title and main image, formatted according to a template. Users can also manually generate/download it from the admin panel.

## User Review Required

> [!IMPORTANT]
> I need the **Photocard Template** details. Since you mentioned "I will give you a template" (tmk template debo), please describe the design or upload a reference image. I will assume a default layout (Image background + Title overlay with Logo) until you provide the specific template.

## Proposed Changes

### 1. Database & Storage
- Add `photocard_url` column to `posts` table in Supabase.
- Store generated photocards in Cloudflare R2 under the `photocards/` prefix.

### 2. Server-side Logic
- Create `src/lib/photocard.server.ts`:
    - Logic to generate an image using a canvas-like approach or AI image generation (Cloudflare Flux) if it needs to be complex.
    - If it's a simple template (Image + Text + Logo), I will use a server function that renders HTML to an image or uses a library if available in the Worker environment (though `node-canvas` is restricted, we can use SVG or a dedicated API).
    - Function `generatePhotocard(postId)`: Fetches post data, combines image + title + logo into a photocard, uploads to R2, and updates the database.
- Create `src/lib/photocard.functions.ts`:
    - Server function `createPhotocard` to trigger generation manually.
    - Server function `getPhotocardDownloadUrl` to provide a direct download link.

### 3. Admin Integration
- **`src/routes/admin/write.tsx`**:
    - Add a "Photocard Generate" button in the admin editor (near the "পাবলিশ" button or in the sidebar).
    - Auto-trigger `generatePhotocard` inside the `saveMutation` when the status is `published`.
- **`src/routes/admin/posts.tsx`**:
    - Add a download icon/button in the posts list to download the photocard for existing published news.

### 4. Frontend Component
- Create `src/components/photocard-preview.tsx`: A component to display how the photocard looks before downloading.

## Technical Details

- **Image Generation**: Since Cloudflare Workers have limited support for heavy image libraries like `sharp` or `canvas`, I will use a high-quality SVG generation technique that converts to PNG via a specialized worker-friendly method or an external API if needed.
- **Workflow**:
    1. News Published -> Trigger Server Function.
    2. Server Function -> Fetch Post Title & Main Image.
    3. Server Function -> Compose Template (SVG/HTML) -> Convert to PNG.
    4. R2 Upload -> Save URL to Post Table.
    5. Admin UI -> Show "Download Photocard" button.

## Verification Plan

### Manual Verification
- Create a new news post and verify if a photocard is generated upon clicking "পাবলিশ".
- Navigate to the Admin Posts list and try downloading a photocard for a previously published news.
- Verify the photocard contains the correct Title, Image, and Logo.

### Automated Checks
- Run `lovable-exec test` if applicable.
- Check build logs for any server function bundling issues.

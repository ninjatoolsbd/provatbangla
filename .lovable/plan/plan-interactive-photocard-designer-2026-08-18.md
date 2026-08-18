# Plan - Interactive Photocard Designer

Implement a professional, interactive photocard designer in the admin panel, allowing real-time editing of templates, text, colors, and layouts before downloading, similar to the reference site.

## User Review Required

> [!IMPORTANT]
> The current photocard generation is server-side via SVG. To achieve the "Canvas-like" interactivity shown in the reference (real-time text placement, color changes, and template switching), I will implement a client-side designer using `fabric.js` or a custom HTML5 Canvas wrapper.

- **Templates:** Do you have specific template images (like the one you shared) for different styles, or should I design a few generic professional news templates?
- **Features:** The reference shows a sidebar with Line 1, Line 2, and Line 3. Should I strictly follow that 3-line headline structure for all templates?

## Proposed Changes

### 1. New Designer Component
- Create `src/components/photocard-designer.tsx`.
- Use HTML5 Canvas to render the photocard.
- Support layers: Background Image, Template Frame (with transparency), Text Layers, and Brand/Logo layer.
- Controls for:
    - Text content (Line 1, 2, 3).
    - Font size and alignment.
    - Background color (for text areas or overlays).
    - Image scaling and positioning (dragging inside the frame).

### 2. Admin Route Update
- Update `src/routes/admin/photocards.tsx` to include an "Edit & Design" button.
- Opening a post in the designer will pre-fill the canvas with the news title and featured image.

### 3. Template Engine
- Update `src/lib/photocard.server.ts` (or create a client-side version) to support multiple template configurations.
- Define template regions (where the photo goes, where the text goes).

### 4. Download & Export
- Implement client-side export to PNG/JPG at high resolution (e.g., 1200x630 or 1086x1448).
- Option to save the design configuration to Supabase so it can be re-edited later.

## Technical Details

- **Canvas Library:** Use `fabric.js` for robust object manipulation (dragging text, scaling images).
- **Font Rendering:** Ensure `SolaimanLipi` is pre-loaded for the canvas to prevent rendering issues.
- **Data Model:** Add a `photocard_config` JSONB column to the `posts` table to store text positions and colors.
- **Performance:** Handle image resizing client-side to maintain high quality for the final export.

## Next Steps

1. Install `fabric` and `@types/fabric`.
2. Create the designer UI with the sidebar controls shown in the user's screenshot.
3. Integrate the designer into the `admin/write` sidebar and `admin/photocards` list.

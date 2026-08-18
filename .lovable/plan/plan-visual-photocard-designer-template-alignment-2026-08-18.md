# Plan - Visual Photocard Designer & Template Alignment

The user is not satisfied with the previous implementation and wants a photocard designer that matches their reference screenshot (`newscard.site` clone) more closely, where title, image, header, and colors can be manually adjusted.

## User Preferences
- **Template Accuracy**: The design must follow the provided template (`photocard-frame.png`).
- **Interactive Editing**: Ability to manually adjust image positioning, multi-line headlines, font sizes, and colors.
- **Workflow**: Auto-open the designer when a feature image is uploaded (if title exists).

## Proposed Changes

### 1. Enhanced Photocard Designer Component
- Upgrade `src/components/photocard-designer.tsx` to match the "Newscard" UI layout:
    - Left sidebar with dedicated inputs for Line 1 (Date/Header), Line 2 (Headline part 1), Line 3 (Headline part 2).
    - Color picker for text and background elements.
    - Improved Fabric.js implementation for easier object manipulation (image cropping/scaling within the template window).
    - Proper Bengali typography (SolaimanLipi) integration within the canvas.

### 2. Live Admin Integration
- Refine the trigger in `src/routes/admin/write.tsx`:
    - Ensure `isDesignerOpen` triggers correctly after image upload.
    - Pass current title and image URL to the designer.

### 3. Server-side Alignment
- Update `src/lib/photocard.server.ts` to reflect any changes in the default generation logic so that auto-generated ones (without the designer) still match the new refined style.
- Ensure the "Date Badge" logic correctly places the current date in Bengali.

## Technical Details
- **Fabric.js**: Use it to manage layers: Background Image -> Gradient Overlay -> Text Layers -> Fixed Template Frame.
- **SolaimanLipi**: Ensure the font is loaded in the browser context for the canvas to render it correctly.
- **Asset Management**: Use the existing `src/assets/photocard-frame.png.asset.json` for the frame.

## Verification Plan
1. **Visual Test**: Upload an image in the admin panel and verify the designer opens.
2. **Interactive Test**: Change text lines and font sizes in the designer sidebar and see real-time updates on the canvas.
3. **Download Test**: Click the download button and verify the resulting PNG matches the design.
4. **Layout Check**: Verify the date is correctly formatted in Bengali (e.g., "১৮ আগস্ট, ২০২৬").

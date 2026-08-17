# Plan - Integrate Rich Text Editor in Admin Panel

The user wants to replace the standard `Textarea` with a WordPress-style rich text editor in the "Write News" section of the admin panel. We will use `tiptap`, which is a highly customizable and modern rich text editor for React.

## Proposed Changes

### Dependencies
- Install `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, and `@tiptap/extension-underline`.

### Components
#### [NEW] `src/components/rich-text-editor.tsx`
- Create a reusable rich text editor component using Tiptap.
- Include a toolbar with standard formatting options (Bold, Italic, Underline, Lists, Links, Heading levels).
- Support for image insertion (using the existing upload logic).
- Ensure the styling matches the current SolaimanLipi font and news portal aesthetics.

### Admin Panel
#### `src/routes/admin/write.tsx`
- Replace the current `Textarea` for the main content with the new `RichTextEditor` component.
- Update the word/character count logic to work with HTML content (stripping tags for count).
- Ensure the "AI Rewrite" and "Auto Metadata" features still work correctly with the HTML output from the editor.

## Technical Details
- Tiptap provides a headless editor, so we will style it using Tailwind CSS to match the existing UI.
- The content will be stored as HTML in the Supabase `posts` table (consistent with typical CMS behavior).
- AI prompts for rewriting will be updated to handle/ignore HTML tags where appropriate, or we will pass plain text to the AI and re-wrap if necessary (though Gemini handles HTML reasonably well).

## Verification Plan
### Automated Tests
- Verify that the editor renders correctly on the `/admin/write` route.
- Check that formatting buttons apply the correct HTML tags.
- Verify word count updates as text is entered.

### Manual Verification
- Create a new post using the rich text editor with various formatting (bold, links).
- Trigger AI rewriting and ensure the formatted content is handled correctly.
- Save as draft and publish to verify the content renders correctly on the public news page.

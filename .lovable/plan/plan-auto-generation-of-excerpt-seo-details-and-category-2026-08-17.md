# Plan - Auto-generation of Excerpt, SEO details, and Category

Automate the generation of summary (excerpt), SEO title, and SEO description based on the article's title and content. Additionally, automatically select the most relevant category.

## User Review Required

> [!IMPORTANT]
> The auto-generation will trigger when both the **Title** and **Main Content** fields have substantial text. This will use the AI (Gemini) to analyze your content and fill in the fields. You will still be able to edit them after they are generated.

- Should auto-generation happen instantly as you type, or should there be a small "Generate Metadata" button/indicator? (I will implement a smart debounce to avoid constant AI calls).
- For category auto-selection, do you want it to lock the choice, or just suggest it in the dropdown? (I will implement it as an automatic selection that you can still change).

## Technical Details

### 1. New Server Function
- Create `src/lib/news-metadata.functions.ts` to handle the batch generation of:
  - Excerpt (summary)
  - SEO Title
  - SEO Description
  - Category Suggestion (reusing/integrating logic from `src/lib/news-suggest.functions.ts`)

### 2. UI Integration in `src/routes/admin/write.tsx`
- Add a `useEffect` hook to monitor `title` and `content`.
- When both are present and meet a length threshold (e.g., content > 100 characters):
  - Call the metadata generation function.
  - Update `excerpt`, `seoTitle`, `seoDesc`, and `category` states.
  - Show a subtle loading state/toast while AI is thinking.

### 3. AI Prompting
- Update the system prompt to return a clean JSON object containing all four fields.
- Ensure the SEO title is optimized for ~60 chars and description for ~155 chars in Bengali.

### 4. Logic Safeguards
- Prevent auto-generation from overwriting fields if the user has already manually typed in them.
- Add a "Manual Trigger" icon/button for users who want to regenerate.

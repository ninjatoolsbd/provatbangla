# Plan

## Changes
- Remove every Photocard button, panel, action, route integration, and related generated-photocard workflow from the site and admin UI.
- Trace author display in the editor and publishing flow, then make it use the post’s actual author identity/name instead of the signed-in account username.
- Correct affected existing post data where the author is Taufiq but currently appears as bbh2270.

## Verification
- Check all code references to Photocard are gone from user-facing flows.
- Verify the editor and published article show the correct author, and check current build diagnostics.

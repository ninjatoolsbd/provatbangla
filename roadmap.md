# Requested deliverables
- [ ] Migrate data and login to the user's personal Supabase while retaining R2/AI and verify auto-news; awaiting full Cloud database export including auth accounts before any connection cutover.
- [x] Assess personal-Supabase migration readiness without changing the current connection; verify current backend, public endpoints, schedules, and code dependencies, and report destination verification limits.
- [x] Create Postman v2.1 collection covering existing authentication, all tables, callable RPCs, storage, and public HTTP routes.
- [x] Document permission restrictions, framework-only functions, connection placeholders, and verification limits.
- [x] Validate the collection and deliver the files without credentials or production mutations.
- [x] Inspect daily auto-news schedules and recent collection results.
- [x] Point daily calls at the stable published project URL and honor the automation-enabled setting before dispatch.
- [ ] Verify a successful bounded source collection after publishing the current code; blocked by the published version still processing all sources and hitting request limits.
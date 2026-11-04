<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Server code that needs privileged DB access uses `adminCloud`/`getAdminCloudClient` from `src/lib/admin-cloud-client.server.ts`, not `supabaseAdmin` — the self-hosted Cloudflare Worker has no SUPABASE_SERVICE_ROLE_KEY env, so `supabaseAdmin` throws there.
- Daily auto-news schedules call the stable published project URL with one source and one article per request, and check the persisted automation-enabled setting before dispatch; this avoids domain drift and limits per-invocation work.
- Text generation uses only external-provider queues, and the legacy Lovable gateway adapter fails closed; this enforces the no-Lovable-AI-credit policy across manual and scheduled callers.

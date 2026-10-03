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

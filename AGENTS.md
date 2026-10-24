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

## Architecture rules
- Access control lives in database RLS + security-definer RPCs (confirm_block, flag_conflict, remove_member, create_village, accept_invite); the UI only mirrors it — never rely on hidden UI for privacy.
- Browser talks to the backend directly with the generated client (RLS applies); no server functions needed for V1.
- Care blocks carry only day/hours/assignee/status — never add free-text, location or photo fields.
- Shared domain helpers (status labels, dates, coverage summary) live in src/lib/dearkin.ts and are unit-tested in src/test.

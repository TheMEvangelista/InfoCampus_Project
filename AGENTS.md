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

- Keep public InfoCampus content reads in `src/lib/content.ts` using the browser publishable client and RLS; this shares typed query shapes across the pages without privileged access.
- Keep route-specific metadata in each leaf route and reusable page content in `src/components/CampusPages.tsx`; this prevents duplicate visual implementations while preserving shareable page titles.

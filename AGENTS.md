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
- Customer chat, bookings and profiles are tied to the signed-in account (user_id); customer server functions use requireSupabaseAuth — why: customers must sign in and history must persist across devices.
- Animations use shared primitives in src/components/motion-primitives.tsx (motion/react) — why: one consistent, reduced-motion-aware system instead of scattered motion code; never wrap grid children in a motion container with display:contents (IntersectionObserver fails, content stays invisible).

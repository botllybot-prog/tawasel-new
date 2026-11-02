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

- Keep dating and rental data and workflows independent; no person identifier or match may be attached to a rental booking.
- Store private profile information with owner-only access; expose dating profiles through a filtered RPC so DOB and hidden data never leave the database.
- Profile photos stay in private storage and pending review until an authorized moderator approves them; photo access follows visibility and block rules.
- Use transactional booking RPCs to calculate owner-set prices and serialize overlap checks; clients cannot set totals or confirmation status directly.
- Use a single shared session provider and generated Cloud clients; public pages may show sign-in prompts, while RLS protects all private actions.
- Keep translations in a shared dictionary with an explicit language provider; Arabic and Sorani use RTL, English uses LTR.
- Rental location selectors share a GeoNames country/city catalog, store country codes separately from city names, and preserve existing city values when editing legacy listings.
- Booking notifications are created by database triggers and read through owner-scoped RLS; realtime refreshes the notification list.
- Direct rental storage reads are owner-only; a server function authorizes exact published-listing photo paths through public RLS before issuing short-lived links, so private uploads cannot be enumerated by other users.

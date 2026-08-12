# The weekly digest is a second Worker with no state

Contracts near expiry are worth an email, not just a screen. A cron trigger sends one at 08:00 Amsterdam time on Mondays.

**That is two cron entries, not one.** Cloudflare cron is UTC-only, and 08:00 Amsterdam is 06:00 UTC in summer and 07:00 UTC in winter. The Worker fires at both hours and `isSendingHour` returns early unless `Intl` puts the scheduled time at 08:00 in `Europe/Amsterdam`. Encoding the changeover as month ranges in the cron expression was rejected: EU DST turns on the last Sunday of March and October, which a month range cannot express, so it would be wrong for up to a week twice a year. Asking `Intl` is exact and stays correct if the rules ever change.

This looks like it contradicts [ADR 0001](0001-stored-status-vs-computed-dates.md), which says there is no cron job. It does not. ADR 0001 forbids a cron that _writes_ lifecycle into the database; the rule that lifecycle is derived from dates at read time is untouched. The digest only reads, through the same `listContractsNeedingAttention` the Needs attention page uses, so the email and the screen can never disagree.

**No notification state is stored.** A per-contract "already notified" column or table would have to be cleared on renewal and would be the only place in the schema recording something the passage of time already tells us. Instead the digest is a weekly snapshot of whatever is inside the 60-day attention window. The trade is that one contract is mentioned in roughly eight consecutive emails before it expires, which for a single-user tool is a feature — it is a nag, not a notification queue. Nothing is stored, so nothing can go stale or need a migration.

**It is a separate Worker (`workers/digest/`) rather than a `scheduled` export on the app.** `@sveltejs/adapter-cloudflare` generates a fetch-only Worker and owns `main` in the root `wrangler.jsonc`, so adding a scheduled handler to the app means wrapping generated output and depending on the adapter's build layout. The second Worker binds the same D1 database and imports `$lib` through a wrangler `alias`, and it deploys independently with `pnpm run digest:deploy`. The cost is a second deploy step; the benefit is that adapter upgrades cannot break the digest.

The digest Worker deliberately has **no `fetch` handler**. It sits outside Cloudflare Access ([ADR 0002](0002-authentication-is-cloudflare-access.md)), so any HTTP entry point on it would serve client data to the open internet. Preview it locally with `pnpm run digest:dev` instead, which exposes wrangler's `__scheduled` test endpoint.

Resend sends the mail, keyed by a `RESEND_API_KEY` secret. Cloudflare Email Sending would avoid the third party but needs domain-level SPF/DKIM setup that is not worth it for one recipient. Failures throw inside `waitUntil` and land in Workers observability; there is no retry, because next Monday is one.

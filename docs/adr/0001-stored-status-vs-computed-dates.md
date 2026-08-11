# Stored status for decisions, computed dates for the passage of time

Projects and Contracts have states that arrive two different ways: some I decide (cancelling a project), and some simply become true when a date passes (a contract expiring at midnight while nobody is using the app). We store the first kind in a `status` column and read the second kind from dates, rather than picking one mechanism for everything.

This deviates from what established systems do, deliberately. Stripe, Chargebee, Salesforce and Odoo all store a status enum _alongside_ the dates and keep the two in sync with a scheduler — Stripe and Chargebee run it for you and notify by webhook, Odoo ships a daily cron. Their reasons (many services reading status, dashboard performance, audit trails) do not apply to a single-user tool with a few hundred rows and no background job infrastructure. Salesforce, which leaves the sync to the customer, is the cautionary case: contracts sit at "Activated" indefinitely past their end date unless you build a nightly job. Deriving the state removes that failure mode entirely.

What we do take from those systems is their state vocabulary rather than their storage mechanism. Chargebee's `non_renewing` — live, but deliberately not being renegotiated — is a decision no date can express, so it sits in `status` exactly as the split intends. Cloudflare Workers does offer Cron Triggers, so the scheduler was available to us; we declined it because a job that can silently stop is a worse failure mode here than a repeated date expression.

The cost we accept is that "expired" is a date expression repeated across queries, which drifts if one place uses `<` and another `<=`. That is contained with a single shared helper rather than a column.

A single stored `status` would need a scheduled job to flip contracts to expired, and between runs the column would be wrong. Purely computed state cannot express a cancellation, which has no date-based rule behind it — only my decision. `status` is a `text` column with the permitted values declared as a TypeScript enum rather than a database constraint, so adding a state later is a code change with no migration.

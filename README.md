# CRM

My own tool for tracking freelance clients: the projects running for them, and the contracts that are about to expire.

One user: me. It runs behind Cloudflare Access, so there is no login screen in the code.

## What it tracks

- **Clients** — the organisations that pay me, and the **contacts** I talk to there.
- **Projects** — work with an end date.
- **Contracts** — recurring service agreements. Money coming in. These expire, and that is the thing I mainly want warning about.
- **Subscriptions** — recurring things I pay for. Money going out.

The front page is **Needs attention**: whatever has a deadline close enough that I should do something now.

Every word above has an exact meaning. They are written down in [CONTEXT.md](CONTEXT.md), and the code uses the same words.

## Two things that look wrong but are not

1. **Nothing stores "expired" or "running".** The database only stores what I decided: `active`, `non_renewing`, `cancelled`. Everything else is worked out from dates when a page loads. No cron job. See [ADR 0001](docs/adr/0001-stored-status-vs-computed-dates.md).
2. **There is no auth code.** Cloudflare Access handles it before a request ever reaches the app. See [ADR 0002](docs/adr/0002-authentication-is-cloudflare-access.md).

Money is stored as whole cents, euros, without VAT.

## Stack

SvelteKit (async + remote functions), Tailwind 4, Drizzle, Cloudflare D1.

Tooling is [Vite+](https://viteplus.dev/guide/), run with `vp`.

## Running it

Install:

```sh
vp install
```

Copy `.env.example` to `.env` and fill in the three Cloudflare values. Drizzle will not start without them.

Start the dev server:

```sh
vp dev
```

Check everything (format, lint, types):

```sh
vp check
```

Note: `vp dev` and `vp check` are built-in Vite+ commands. Anything defined in `package.json` needs `vp run <name>`.

## Database

```sh
vp run db:push       # push schema straight to D1, no migration file
vp run db:generate   # write a migration file from the schema
vp run db:migrate    # apply migration files
vp run db:studio     # browse the data in a UI
```

The schema lives in `src/lib/server/db/schema.ts`.

## Build

```sh
vp build
vp preview
```

## Where things are

```
src/lib/server/db/   schema and database connection
src/routes/          pages
docs/adr/            decisions, with the reasoning
CONTEXT.md           the glossary
CLAUDE.md            rules for AI agents working here
```

## Not building these yet

Agency middleman clients, contact history, project due dates, notice periods, project amounts. Left out on purpose, not forgotten.

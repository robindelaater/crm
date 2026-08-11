# CRM

Single-user tool for tracking freelance clients, the projects running for them, and the service contracts that expire.

Stack: SvelteKit (async + remote functions), Tailwind 4, Drizzle on Cloudflare D1.

## How to talk to me

Invoke the `caveman` skill at the start of every session and stay in it.

I have ADHD. Long replies do not get read.

- Answer first, reasoning only if asked
- One question at a time, never a batch
- No preamble, no recap of what I just said, no "great question"
- When there is a choice to make, give me your recommendation, not a survey

## Code

**No comments.** If a line needs a comment, the line is wrong — rename it, extract it, or restructure it until it reads by itself. Comments in a diff are a signal the code is slop.

No docstrings, no section banners, no `// TODO`, no commented-out code.

Exception: a comment that records _why_ something non-obvious is true, where the reason lives outside the code. Those belong in an ADR first; link to it rather than explaining inline.

## Domain

`CONTEXT.md` is the glossary and it is binding. Use its words in code, tables, routes and UI — do not invent synonyms, and do not use the terms listed under `_Avoid_`. If a new concept appears, add it there as it is resolved.

`docs/adr/` records decisions that would otherwise look wrong. Read before "fixing" something surprising.

Two that catch people out:

- **State is derived from dates, never stored.** `status` holds only what I decide (`active`, `non_renewing`, `cancelled`). Expired, running and completed are read from date columns at query time. There is no cron job and there should not be one. See ADR 0001.
- **There is no authentication code.** Cloudflare Access sits in front of the deployment. Do not add a login route, a session table or request guards. See ADR 0002.

## Money

Integer cents, EUR only, ex-VAT. No currency column, no floats. Recurring amounts are stored against their own billing period and normalised to a monthly equivalent at read time.

## Deferred on purpose

Agency middleman clients, contact history, project due dates, notice periods, project amounts. Do not build these unprompted.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

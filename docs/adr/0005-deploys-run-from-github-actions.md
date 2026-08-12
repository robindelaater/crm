# Deploys run from GitHub Actions, and workers.dev is off

Every push to `main` runs the same pipeline: check, test, build, apply D1 migrations against the remote database, then deploy the app worker and the digest worker. Migrations run inside that pipeline rather than from a laptop so the schema can never be a step ahead of or behind the code that is live. Pull requests run the verify half only.

Cloudflare's own git integration was rejected because it builds one worker per connected project, and this repository ships two — the app and the digest of ADR 0004 — from a single commit that must land together.

The surprising line is `"workers_dev": false` in `wrangler.jsonc`. It is load-bearing. Access is bound to the hostname `crm.delaater.com`, so a live `laater-crm.<subdomain>.workers.dev` URL would serve the same worker with no authentication in front of it, and ADR 0002 leaves the app with nothing of its own to fall back on. Deleting that line publishes an unauthenticated copy of the CRM.

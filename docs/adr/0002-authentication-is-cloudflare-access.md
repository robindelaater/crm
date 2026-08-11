# Authentication is Cloudflare Access, not application code

This app has exactly one user. Rather than build a login form, a session store and a password reset flow for that one user, we put Cloudflare Access in front of the whole deployment. There is deliberately **no authentication code in this repository** — no sessions table, no login route, no middleware guarding requests.

Every request that reaches the app has already been authenticated at the edge, so server code may assume it is serving the owner. The consequence to remember is that this assumption is enforced entirely outside the codebase: if the app is ever deployed somewhere without Access in front of it, it is wide open. The alternative — an in-app password and session table — was rejected as a permanent maintenance burden serving a single person.

This decision is what would need revisiting first if the app ever gains a second user or a client-facing portal, since neither can be expressed through Access alone.

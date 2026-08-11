# Deleting a Client cascades to its Contacts, Projects and Contracts

Deleting a Client removes every Contact, Project and Contract belonging to it. There is no archive flag, no soft delete and no block on deleting a Client that still has work attached — the row goes, and the database takes its children with it.

This is enforced by `ON DELETE cascade` on the `client_id` foreign keys rather than by application code deleting children first. D1 enforces foreign keys by default (`PRAGMA foreign_keys` is `1`), so a single `delete from client` is sufficient and stays correct when a new table gains a `client_id`. The one thing this leans on lives outside the schema: if foreign key enforcement were ever off, the delete would silently orphan rows instead of failing.

Soft deletion was rejected because it infects every query in a single-user tool with a `where deleted_at is null` clause, in exchange for an undo that a person who owns the database does not need. Blocking the delete while children exist was rejected too: it turns removing a client I never worked with into a manual sweep of three lists.

The safety net is therefore the confirmation dialog, not the data model. It names the Client and counts exactly what disappears with it, because that count is the only warning there is.

A Contract that was a **Renewal** of a deleted Client's Contract keeps existing if it belongs to another Client; its `renewal_of_id` is set to null rather than cascading, so history is lost but the live Contract is not.

# CRM

A single-user tool for tracking freelance clients: what work is running for them, and which service agreements are about to expire.

## Language

**Client**:
An organisation that pays me. Always an organisation, even when it is a sole trader whose name is a person's name.
_Avoid_: Customer, account, company

**Contact**:
A human belonging to a **Client** who I actually communicate with. A Client has zero or more Contacts.
_Avoid_: Person, lead, user

**Project**:
A piece of work for a **Client** that has an end. Its state is read from its dates, never stored: unscheduled, running, completed, or cancelled.
_Avoid_: Job, engagement, gig

**Cancelled**:
A **Project** abandoned before delivery, or a **Contract** ended before its expiry date. A decision I make, so it is recorded explicitly. Distinct from completed or expired, and kept distinct on purpose.
_Avoid_: Closed, dropped, dead

**Needs attention**:
The set of things with a deadline close enough that I should act now — chiefly **Contracts** near expiry. It is the front door of the app; client and project lists are navigation behind it.
_Avoid_: Dashboard, alerts, inbox

**Status**:
The state I decide for a **Project** or **Contract**: active, non-renewing, or cancelled. States that arrive by the passage of time (running, completed, expired) are never stored here; they are read from dates.
_Avoid_: State, stage, phase

**Non-renewing**:
A **Contract** I have decided to let run to its expiry date without a **Renewal**. Still live, still serving the client, but no longer up for renegotiation.
_Avoid_: Ending, winding down, lapsing

**Contract**:
A recurring service agreement with a **Client** that runs until it expires or is renewed — money coming in. It is never "finished", only alive or dead. A Contract may optionally name the **Project** it grew out of.
_Avoid_: Retainer, plan

**Subscription**:
A recurring cost I pay a vendor — money going out. Deliberately not a **Contract**: it has no Client, no **Contact**, and never appears in **Needs attention**.
_Avoid_: Expense, cost, bill

**Amount**:
A sum of money on a **Contract** or **Subscription**, always ex-VAT and always in euros. Only recurring things carry an amount; a **Project** does not.
_Avoid_: Price, fee, value

**Monthly equivalent**:
Any recurring **Amount** restated as a per-month figure so **Contracts** and **Subscriptions** on different billing periods can be added up. Always derived, never stored.
_Avoid_: MRR, normalised amount

**Renewal**:
A new **Contract** created to succeed an expiring one, on freshly agreed terms. Contracts never extend in place; the old one is left expired and the new one names it.
_Avoid_: Extension, rollover

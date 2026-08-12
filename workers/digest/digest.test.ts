import { describe, expect, it } from "vite-plus/test";
import { digestHtml, digestSubject, digestText, isSendingHour } from "./digest";
import type { ContractNeedingAttention } from "$lib/server/attention";

const contract = (overrides: Partial<ContractNeedingAttention> = {}) =>
  ({
    name: "Hosting",
    amountCents: 12500,
    billingPeriod: "monthly",
    expiresOn: "2026-09-01",
    daysUntilExpiry: 20,
    lifecycle: "active",
    client: { name: "Acme" },
    ...overrides,
  }) as ContractNeedingAttention;

describe("digestSubject", () => {
  it("stays singular for one contract", () => {
    expect(digestSubject([contract()])).toBe("1 contract needs attention");
  });

  it("pluralises beyond one", () => {
    expect(digestSubject([contract(), contract()])).toBe("2 contracts need attention");
  });
});

describe("digestText", () => {
  it("names the client, the contract and the amount", () => {
    const text = digestText([contract()], "https://crm.laater.dev");

    expect(text).toContain("Acme — Hosting");
    expect(text).toContain("monthly");
    expect(text).toContain("https://crm.laater.dev");
  });

  it("counts down to expiry", () => {
    expect(digestText([contract({ daysUntilExpiry: 20 })], "")).toContain("expires in 20 days");
  });

  it("says today on the expiry date", () => {
    expect(digestText([contract({ daysUntilExpiry: 0 })], "")).toContain("expires today");
  });

  it("says tomorrow the day before", () => {
    expect(digestText([contract({ daysUntilExpiry: 1 })], "")).toContain("expires tomorrow");
  });

  it("reports how long ago an expired contract lapsed", () => {
    expect(digestText([contract({ daysUntilExpiry: -3, lifecycle: "expired" })], "")).toContain(
      "expired 3 days ago",
    );
  });

  it("labels a non-renewing contract", () => {
    expect(digestText([contract({ lifecycle: "non_renewing" })], "")).toContain("Non-renewing");
  });
});

describe("digestHtml", () => {
  it("escapes names that look like markup", () => {
    const html = digestHtml([contract({ client: { name: "<b>Acme</b>" } as never })], "");

    expect(html).toContain("&lt;b&gt;Acme&lt;/b&gt;");
    expect(html).not.toContain("<b>Acme</b>");
  });
});

describe("isSendingHour", () => {
  it("sends at 06:00 UTC under summer time", () => {
    expect(isSendingHour(new Date("2026-08-10T06:00:00Z"))).toBe(true);
  });

  it("skips 07:00 UTC under summer time", () => {
    expect(isSendingHour(new Date("2026-08-10T07:00:00Z"))).toBe(false);
  });

  it("sends at 07:00 UTC under winter time", () => {
    expect(isSendingHour(new Date("2026-12-07T07:00:00Z"))).toBe(true);
  });

  it("skips 06:00 UTC under winter time", () => {
    expect(isSendingHour(new Date("2026-12-07T06:00:00Z"))).toBe(false);
  });

  it("sends on the Monday after the spring clock change", () => {
    expect(isSendingHour(new Date("2026-03-30T06:00:00Z"))).toBe(true);
  });

  it("sends on the Monday after the autumn clock change", () => {
    expect(isSendingHour(new Date("2026-10-26T07:00:00Z"))).toBe(true);
  });
});

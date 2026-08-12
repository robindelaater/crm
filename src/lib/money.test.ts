import { describe, expect, it } from "vite-plus/test";
import {
  formatAmount,
  formatAmountInput,
  monthlyEquivalentCents,
  parseAmountToCents,
} from "./money";

describe("parseAmountToCents", () => {
  it("reads whole euros", () => {
    expect(parseAmountToCents("1200")).toBe(120000);
  });

  it("reads a dutch decimal separator", () => {
    expect(parseAmountToCents("1200,50")).toBe(120050);
  });

  it("reads a dot as decimal separator too", () => {
    expect(parseAmountToCents("1200.50")).toBe(120050);
  });

  it("pads a single decimal", () => {
    expect(parseAmountToCents("1200,5")).toBe(120050);
  });

  it("strips the euro sign and spaces", () => {
    expect(parseAmountToCents(" € 1 200,50 ")).toBe(120050);
  });

  it("treats a lone dot before three digits as grouping", () => {
    expect(parseAmountToCents("1.200")).toBe(120000);
  });

  it("treats a lone comma before three digits as grouping", () => {
    expect(parseAmountToCents("1,200")).toBe(120000);
  });

  it("reads grouping and decimals together", () => {
    expect(parseAmountToCents("1.234.567,89")).toBe(123456789);
  });

  it("reads english grouping and decimals together", () => {
    expect(parseAmountToCents("1,234,567.89")).toBe(123456789);
  });

  it("keeps zero", () => {
    expect(parseAmountToCents("0")).toBe(0);
  });

  it("keeps sub-euro amounts", () => {
    expect(parseAmountToCents("0,05")).toBe(5);
  });

  it("rejects an empty string", () => {
    expect(parseAmountToCents("")).toBe(null);
  });

  it("rejects blank input", () => {
    expect(parseAmountToCents("  ")).toBe(null);
  });

  it("still reads three trailing digits as grouping", () => {
    expect(parseAmountToCents("12,345")).toBe(1234500);
  });

  it("rejects more precision than cents", () => {
    expect(parseAmountToCents("12,3456")).toBe(null);
  });

  it("rejects negatives", () => {
    expect(parseAmountToCents("-12,00")).toBe(null);
  });

  it("rejects letters", () => {
    expect(parseAmountToCents("twelve")).toBe(null);
  });

  it("rejects mangled grouping", () => {
    expect(parseAmountToCents("1.2345,67")).toBe(null);
  });

  it("rejects a trailing separator", () => {
    expect(parseAmountToCents("12,")).toBe(null);
  });
});

describe("formatAmount", () => {
  it("formats whole euros", () => {
    expect(formatAmount(120000)).toBe("€ 1.200,00");
  });

  it("formats cents", () => {
    expect(formatAmount(5)).toBe("€ 0,05");
  });

  it("formats zero", () => {
    expect(formatAmount(0)).toBe("€ 0,00");
  });
});

describe("formatAmountInput", () => {
  it("round-trips through the parser", () => {
    expect(parseAmountToCents(formatAmountInput(120050))).toBe(120050);
  });

  it("pads the cents", () => {
    expect(formatAmountInput(1205)).toBe("12,05");
  });

  it("leaves out grouping", () => {
    expect(formatAmountInput(123456789)).toBe("1234567,89");
  });
});

describe("monthlyEquivalentCents", () => {
  it("leaves a monthly amount alone", () => {
    expect(monthlyEquivalentCents(120000, "monthly")).toBe(120000);
  });

  it("thirds a quarterly amount", () => {
    expect(monthlyEquivalentCents(300000, "quarterly")).toBe(100000);
  });

  it("twelfths a yearly amount", () => {
    expect(monthlyEquivalentCents(120000, "yearly")).toBe(10000);
  });

  it("rounds to whole cents", () => {
    expect(monthlyEquivalentCents(10000, "quarterly")).toBe(3333);
  });
});

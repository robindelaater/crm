import { describe, expect, it } from "vite-plus/test";
import { contractLifecycle, daysUntil, projectLifecycle } from "./lifecycle";

const on = "2026-08-11";

describe("projectLifecycle", () => {
  it("is unscheduled without a start date", () => {
    expect(projectLifecycle({ status: "active", startedOn: null, completedOn: null }, on)).toBe(
      "unscheduled",
    );
  });

  it("is scheduled until the start date arrives", () => {
    expect(
      projectLifecycle({ status: "active", startedOn: "2026-08-12", completedOn: null }, on),
    ).toBe("scheduled");
  });

  it("keeps a future start scheduled even long before it", () => {
    expect(
      projectLifecycle({ status: "active", startedOn: "2027-01-01", completedOn: null }, on),
    ).toBe("scheduled");
  });

  it("is running on the start date itself", () => {
    expect(projectLifecycle({ status: "active", startedOn: on, completedOn: null }, on)).toBe(
      "running",
    );
  });

  it("is completed on the completion date itself", () => {
    expect(
      projectLifecycle({ status: "active", startedOn: "2026-01-01", completedOn: on }, on),
    ).toBe("completed");
  });

  it("is still running while the completion date is in the future", () => {
    expect(
      projectLifecycle(
        { status: "active", startedOn: "2026-01-01", completedOn: "2026-08-12" },
        on,
      ),
    ).toBe("running");
  });

  it("lets a cancellation beat the dates", () => {
    expect(
      projectLifecycle({ status: "cancelled", startedOn: "2026-01-01", completedOn: on }, on),
    ).toBe("cancelled");
  });
});

describe("contractLifecycle", () => {
  it("is active while the expiry date is in the future", () => {
    expect(contractLifecycle({ status: "active", expiresOn: "2026-08-12" }, on)).toBe("active");
  });

  it("is still active on the expiry date itself", () => {
    expect(contractLifecycle({ status: "active", expiresOn: on }, on)).toBe("active");
  });

  it("is expired the day after the expiry date", () => {
    expect(contractLifecycle({ status: "active", expiresOn: "2026-08-10" }, on)).toBe("expired");
  });

  it("expires a non-renewing contract too", () => {
    expect(contractLifecycle({ status: "non_renewing", expiresOn: "2026-08-10" }, on)).toBe(
      "expired",
    );
  });

  it("keeps a live non-renewing contract non-renewing", () => {
    expect(contractLifecycle({ status: "non_renewing", expiresOn: "2026-09-01" }, on)).toBe(
      "non_renewing",
    );
  });

  it("lets a cancellation beat the dates", () => {
    expect(contractLifecycle({ status: "cancelled", expiresOn: "2026-09-01" }, on)).toBe(
      "cancelled",
    );
  });
});

describe("daysUntil", () => {
  it("counts zero on the day itself", () => {
    expect(daysUntil(on, on)).toBe(0);
  });

  it("counts forwards", () => {
    expect(daysUntil("2026-09-10", on)).toBe(30);
  });

  it("counts backwards past the date", () => {
    expect(daysUntil("2026-08-01", on)).toBe(-10);
  });

  it("survives a daylight saving change", () => {
    expect(daysUntil("2026-11-01", "2026-10-01")).toBe(31);
  });
});

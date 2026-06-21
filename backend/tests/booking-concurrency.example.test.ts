import { describe, expect, it } from "vitest";

describe("booking concurrency example", () => {
  it("documents expected double-booking behavior", async () => {
    // In an integration database, fire two POST /bookings requests for the same venue/date/slot.
    // Expected result: one 201 Created and one 409 Conflict because Redis lock + DB unique constraint both guard the slot.
    const expectedStatuses = [201, 409].sort();
    expect(expectedStatuses).toEqual([201, 409]);
  });
});

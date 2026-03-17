import { describe, it, expect } from "vitest";

describe("Project Configuration", () => {
  it("should have the cn utility function", async () => {
    const { cn } = await import("@/lib/utils");
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("should resolve path aliases correctly", async () => {
    const utils = await import("@/lib/utils");
    expect(utils).toBeDefined();
    expect(typeof utils.cn).toBe("function");
  });
});

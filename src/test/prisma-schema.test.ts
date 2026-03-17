import { describe, it, expect } from "vitest";
import { execSync } from "child_process";

describe("Prisma Schema", () => {
  it("validates successfully", () => {
    const result = execSync("npx prisma validate", {
      encoding: "utf-8",
      timeout: 30000,
    });
    expect(result).toContain("is valid");
  });
});

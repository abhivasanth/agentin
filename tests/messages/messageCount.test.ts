import { describe, it, expect } from "vitest";

const FREE_LIMIT = 10;

function isPaid(monthlyCount: number): boolean {
  return monthlyCount >= FREE_LIMIT;
}

function freeRemaining(monthlyCount: number): number {
  return Math.max(0, FREE_LIMIT - monthlyCount);
}

describe("message payment threshold", () => {
  it("message 1 is free", () => {
    expect(isPaid(0)).toBe(false);
  });

  it("message 10 is free", () => {
    expect(isPaid(9)).toBe(false);
  });

  it("message 11 is paid", () => {
    expect(isPaid(10)).toBe(true);
  });

  it("remaining decrements correctly", () => {
    expect(freeRemaining(7)).toBe(3);
    expect(freeRemaining(10)).toBe(0);
    expect(freeRemaining(15)).toBe(0);
  });
});

import { describe, it, expect } from "vitest";
import { isTerminalOrderStatus, type BackendOrderStatus } from "./order";

describe("isTerminalOrderStatus", () => {
  it("treats COMPLETED, REJECTED, CANCELLED as terminal", () => {
    const terminal: BackendOrderStatus[] = ["COMPLETED", "REJECTED", "CANCELLED"];
    terminal.forEach((status) => expect(isTerminalOrderStatus(status)).toBe(true));
  });

  it("treats CART, DRAFT, PENDING, PROCESSING, DISPATCHED as non-terminal", () => {
    const nonTerminal: BackendOrderStatus[] = [
      "CART",
      "DRAFT",
      "PENDING",
      "PROCESSING",
      "DISPATCHED",
    ];
    nonTerminal.forEach((status) => expect(isTerminalOrderStatus(status)).toBe(false));
  });
});

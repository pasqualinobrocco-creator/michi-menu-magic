import { describe, expect, test } from "bun:test";
import { formatPrice } from "./menu";

describe("prezzi dei menu", () => {
  test("mostra il simbolo euro accanto al prezzo", () => {
    expect(formatPrice(12)).toBe("12 €");
    expect(formatPrice(3.5)).toBe("3,50 €");
    expect(formatPrice(0)).toBe("0 €");
    expect(formatPrice(null)).toBe("");
  });
});
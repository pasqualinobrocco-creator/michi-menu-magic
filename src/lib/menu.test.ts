import { describe, test } from "node:test";
import { strictEqual } from "node:assert";
import { formatPrice } from "./menu";

describe("prezzi dei menu", () => {
  test("mostra i prezzi senza simbolo euro e con virgola decimale", () => {
    strictEqual(formatPrice(12), "12");
    strictEqual(formatPrice(3.5), "3,50");
    strictEqual(formatPrice(0), "0");
    strictEqual(formatPrice(null), "");
  });
});
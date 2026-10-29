import { describe, expect, it } from "vitest";
import { capitalize, formatPrice, formatWeight, titleCase } from "./format";

describe("formatPrice", () => {
  it("always shows two decimals and the currency", () => {
    expect(formatPrice(9.99)).toBe("9.99 USD");
    expect(formatPrice(9)).toBe("9.00 USD");
    expect(formatPrice(7.5)).toBe("7.50 USD");
    expect(formatPrice(0)).toBe("0.00 USD");
  });

  it("returns undefined when there is no price", () => {
    expect(formatPrice(undefined)).toBeUndefined();
  });
});

describe("formatWeight", () => {
  it("formats grams", () => {
    expect(formatWeight(180)).toBe("180 g");
  });

  it("returns undefined when there is no weight", () => {
    expect(formatWeight(undefined)).toBeUndefined();
  });
});

describe("capitalize / titleCase", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("bacon")).toBe("Bacon");
    expect(capitalize("")).toBe("");
  });

  it("title-cases lowercase drink names", () => {
    expect(titleCase("Long island ice tea")).toBe("Long Island Ice Tea");
    expect(titleCase("coffee")).toBe("Coffee");
  });
});

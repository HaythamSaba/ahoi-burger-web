import { describe, expect, it } from "vitest";
import type { BurgerDto, DrinkDto, RestaurantDto } from "./dto";
import {
  isBurgerAvailable,
  mapBurger,
  mapDrink,
  mapRestaurant,
  slugify,
} from "./mapper";

const NOW = new Date("2026-01-01T00:00:00Z");

// The tests feed in data the types don't allow (null, wrong types),
// exactly like a broken server response would.
const burgerDto = (fields: Record<string, unknown>) =>
  fields as unknown as BurgerDto;
const drinkDto = (fields: Record<string, unknown>) =>
  fields as unknown as DrinkDto;
const restaurantDto = (fields: Record<string, unknown>) =>
  fields as unknown as RestaurantDto;

describe("slugify", () => {
  it("turns a name into a URL-safe ID", () => {
    expect(slugify("Big Burger")).toBe("big-burger");
    expect(slugify("  Long island ice tea! ")).toBe("long-island-ice-tea");
  });

  it("removes accents", () => {
    expect(slugify("Café Crème")).toBe("cafe-creme");
  });

  it("returns an empty string for names without latin letters or digits", () => {
    expect(slugify("برجر")).toBe("");
  });
});

describe("isBurgerAvailable", () => {
  it("is available when in_stock and dates are missing", () => {
    expect(isBurgerAvailable(undefined, NOW)).toBe(true);
    expect(isBurgerAvailable({}, NOW)).toBe(true);
  });

  it("is unavailable when out of stock", () => {
    expect(isBurgerAvailable({ in_stock: false }, NOW)).toBe(false);
  });

  it("is unavailable before availableSince (Unix ms)", () => {
    const tomorrow = NOW.getTime() + 24 * 60 * 60 * 1000;
    expect(isBurgerAvailable({ availableSince: tomorrow }, NOW)).toBe(false);
    expect(isBurgerAvailable({ availableSince: 1605394800000 }, NOW)).toBe(
      true,
    );
  });

  it("is unavailable after available_until (ISO date)", () => {
    expect(
      isBurgerAvailable({ available_until: "2021-12-12T00:00:00Z" }, NOW),
    ).toBe(false);
    expect(
      isBurgerAvailable({ available_until: "2035-11-25T00:00:00Z" }, NOW),
    ).toBe(true);
  });

  it("ignores invalid or wrongly typed values", () => {
    const info = burgerDto({
      info: { in_stock: null, availableSince: "soon", available_until: "?" },
    }).info;
    expect(isBurgerAvailable(info, NOW)).toBe(true);
    expect(isBurgerAvailable(null as unknown as BurgerDto["info"], NOW)).toBe(
      true,
    );
  });
});

describe("mapBurger", () => {
  it("maps the snake_case and nested fields", () => {
    const burger = mapBurger(
      {
        name: "Big Burger",
        description: "This is a very tasty burger",
        weight_grams: 180,
        price_usd: 9.99,
        info: {
          in_stock: true,
          vegetarian: false,
          allergens_contained_in: ["rr", "xx"],
          img: "https://example.com/big.png",
        },
        tags: ["bacon", "tomatoes"],
      },
      NOW,
    );

    expect(burger).toEqual({
      kind: "burger",
      id: "big-burger",
      name: "Big Burger",
      description: "This is a very tasty burger",
      priceUsd: 9.99,
      imageUrl: "https://example.com/big.png",
      allergens: ["rr", "xx"],
      isAvailable: true,
      weightGrams: 180,
      vegetarian: false,
      ingredients: ["bacon", "tomatoes"],
    });
  });

  it("uses safe defaults for missing fields (like Fish Burger)", () => {
    const burger = mapBurger({ name: "Fish Burger" }, NOW);

    expect(burger).toMatchObject({
      allergens: [],
      ingredients: [],
      isAvailable: true,
    });
    expect(burger?.weightGrams).toBeUndefined();
    expect(burger?.vegetarian).toBeUndefined();
    expect(burger?.priceUsd).toBeUndefined();
  });

  it("treats null, wrongly typed and negative values as missing", () => {
    const burger = mapBurger(
      burgerDto({
        name: "Broken Burger",
        description: "   ",
        price_usd: null,
        weight_grams: -5,
        info: {
          vegetarian: null,
          allergens_contained_in: ["rr", null, 3, ""],
          img: 42,
        },
        tags: "bacon",
      }),
      NOW,
    );

    expect(burger).toMatchObject({
      description: undefined,
      priceUsd: undefined,
      weightGrams: undefined,
      vegetarian: undefined,
      imageUrl: undefined,
      allergens: ["rr"],
      ingredients: [],
    });
  });

  it("skips burgers without a name", () => {
    expect(mapBurger(burgerDto({ price_usd: 5 }), NOW)).toBeUndefined();
    expect(mapBurger(burgerDto({ name: "  " }), NOW)).toBeUndefined();
  });
});

describe("mapDrink", () => {
  it("maps the drink shape (price, allergens and img at the top level)", () => {
    expect(
      mapDrink({ name: "Orange juice", price: 6.99, allergens: ["oo"] }),
    ).toMatchObject({
      kind: "drink",
      id: "orange-juice",
      priceUsd: 6.99,
      allergens: ["oo"],
      isAvailable: true,
    });
  });

  it("defaults missing allergens to an empty list (like Coffee)", () => {
    expect(mapDrink({ name: "Coffee" })?.allergens).toEqual([]);
  });

  it("skips drinks without a name", () => {
    expect(mapDrink(drinkDto({ name: null }))).toBeUndefined();
  });
});

describe("mapRestaurant", () => {
  it("joins the address parts that exist", () => {
    const restaurant = mapRestaurant(
      {
        name: "Ahoi Burger!",
        address: {
          street: "Sesame street 1",
          city: "Linz",
          country: { name: "Austria" },
        },
      },
      NOW,
    );

    expect(restaurant.address).toBe("Sesame street 1, Linz, Austria");
    expect(mapRestaurant({ name: "X" }, NOW).address).toBe("");
  });

  it("handles missing or invalid lists and drops null items", () => {
    const restaurant = mapRestaurant(
      restaurantDto({
        name: "Ahoi Burger!",
        offered_burgers: [null, { name: "Big Burger" }, "oops"],
        offered_drinks: "none",
      }),
      NOW,
    );

    expect(restaurant.burgers.map((b) => b.id)).toEqual(["big-burger"]);
    expect(restaurant.drinks).toEqual([]);
  });

  it("falls back to a generic name when the restaurant has none", () => {
    expect(mapRestaurant(restaurantDto({}), NOW).name).toBe("Menu");
  });

  it("gives every item a unique ID", () => {
    const restaurant = mapRestaurant(
      {
        name: "Ahoi Burger!",
        offered_burgers: [
          { name: "Big Burger" },
          { name: "big burger" },
          { name: "Big Burger" },
          { name: "برجر" },
        ],
      },
      NOW,
    );

    expect(restaurant.burgers.map((b) => b.id)).toEqual([
      "big-burger",
      "big-burger-2",
      "big-burger-3",
      "item-4",
    ]);
  });

  it("uses separate ID spaces for burgers and drinks", () => {
    const restaurant = mapRestaurant(
      {
        name: "Ahoi Burger!",
        offered_burgers: [{ name: "Classic" }],
        offered_drinks: [{ name: "Classic" }],
      },
      NOW,
    );

    expect(restaurant.burgers[0].id).toBe("classic");
    expect(restaurant.drinks[0].id).toBe("classic");
  });
});

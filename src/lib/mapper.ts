import type { BurgerDto, DrinkDto, RestaurantDto } from "./dto";
import type { Burger, Drink, MenuItem, Restaurant } from "./models";

// The DTO types describe the expected JSON, but the server can still send
// null or wrongly typed values. These guards turn anything unexpected into
// "missing", so the UI never shows "null", "NaN" or crashes.

function asText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

/** Prices and weights: a finite number that is not negative. */
function asAmount(value: unknown): number | undefined {
  const number = asNumber(value);
  return number !== undefined && number >= 0 ? number : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asTextList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(asText).filter((text) => text !== undefined);
}

/** Keeps only the objects of a list; anything else (null, strings) is dropped. */
function asObjectList<T extends object>(value: T[] | undefined): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "object" && item !== null);
}

/** The API has no IDs, so we derive a URL-safe one from the name. */
export function slugify(name: string): string {
  return name
    .normalize("NFKD") // "Café" -> "Cafe" + combining accent
    .replace(/[̀-ͯ]/g, "") // drop the accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Slugs can collide (two items with the same name) or be empty (a name with
 * no latin letters or digits). Duplicates get a suffix ("big-burger-2"),
 * empty slugs fall back to the item's position ("item-3").
 */
export function withUniqueIds<T extends MenuItem>(items: T[]): T[] {
  const taken = new Set<string>();

  return items.map((item, index) => {
    const base = item.id || `item-${index + 1}`;
    let id = base;
    for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
    taken.add(id);
    return { ...item, id };
  });
}

/**
 * A burger is available unless:
 * - it is explicitly out of stock (missing in_stock counts as in stock), or
 * - its availability window has not started yet / has already ended.
 * Missing or invalid dates mean "no limit".
 */
export function isBurgerAvailable(info: BurgerDto["info"], now: Date): boolean {
  if (asBoolean(info?.in_stock) === false) return false;

  const since = asNumber(info?.availableSince);
  if (since !== undefined && now.getTime() < since) return false;

  const untilText = asText(info?.available_until);
  if (untilText) {
    const until = new Date(untilText);
    if (!Number.isNaN(until.getTime()) && now > until) return false;
  }

  return true;
}

/** Returns undefined for burgers without a name; they can't be shown or linked. */
export function mapBurger(dto: BurgerDto, now: Date): Burger | undefined {
  const name = asText(dto.name);
  if (!name) return undefined;

  return {
    kind: "burger",
    id: slugify(name),
    name,
    description: asText(dto.description),
    priceUsd: asAmount(dto.price_usd),
    imageUrl: asText(dto.info?.img),
    allergens: asTextList(dto.info?.allergens_contained_in),
    isAvailable: isBurgerAvailable(dto.info, now),
    weightGrams: asAmount(dto.weight_grams),
    vegetarian: asBoolean(dto.info?.vegetarian),
    ingredients: asTextList(dto.tags),
  };
}

/** Returns undefined for drinks without a name; they can't be shown or linked. */
export function mapDrink(dto: DrinkDto): Drink | undefined {
  const name = asText(dto.name);
  if (!name) return undefined;

  return {
    kind: "drink",
    id: slugify(name),
    name,
    description: asText(dto.description),
    priceUsd: asAmount(dto.price),
    imageUrl: asText(dto.img),
    allergens: asTextList(dto.allergens),
    isAvailable: true, // drinks have no availability data
  };
}

function formatAddress(address: RestaurantDto["address"]): string {
  return [address?.street, address?.city, address?.country?.name]
    .map(asText)
    .filter(Boolean)
    .join(", ");
}

export function mapRestaurant(
  dto: RestaurantDto,
  now: Date = new Date(),
): Restaurant {
  const burgers = asObjectList(dto.offered_burgers)
    .map((burger) => mapBurger(burger, now))
    .filter((burger) => burger !== undefined);

  const drinks = asObjectList(dto.offered_drinks)
    .map(mapDrink)
    .filter((drink) => drink !== undefined);

  return {
    name: asText(dto.name) ?? "Menu",
    address: formatAddress(dto.address),
    burgers: withUniqueIds(burgers),
    drinks: withUniqueIds(drinks),
  };
}

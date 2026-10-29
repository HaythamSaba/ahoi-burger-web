import type { BurgerDto, DrinkDto, RestaurantDto } from "./dto";
import type { Burger, Drink, Restaurant } from "./models";

/** The API has no IDs, so we derive a URL-safe one from the name. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * A burger is available unless:
 * - it is explicitly out of stock (missing in_stock counts as in stock), or
 * - its availability window has not started yet / has already ended.
 */
export function isBurgerAvailable(info: BurgerDto["info"], now: Date): boolean {
  if (info?.in_stock === false) return false;

  if (
    info?.availableSince !== undefined &&
    now.getTime() < info.availableSince
  ) {
    return false;
  }

  if (info?.available_until) {
    const until = new Date(info.available_until);
    if (!Number.isNaN(until.getTime()) && now > until) return false;
  }

  return true;
}

export function mapBurger(dto: BurgerDto, now: Date): Burger {
  return {
    kind: "burger",
    id: slugify(dto.name),
    name: dto.name,
    description: dto.description,
    priceUsd: dto.price_usd,
    imageUrl: dto.info?.img,
    allergens: dto.info?.allergens_contained_in ?? [],
    isAvailable: isBurgerAvailable(dto.info, now),
    weightGrams: dto.weight_grams,
    vegetarian: dto.info?.vegetarian,
    ingredients: dto.tags ?? [],
  };
}

export function mapDrink(dto: DrinkDto): Drink {
  return {
    kind: "drink",
    id: slugify(dto.name),
    name: dto.name,
    description: dto.description,
    priceUsd: dto.price,
    imageUrl: dto.img,
    allergens: dto.allergens ?? [],
    isAvailable: true, // drinks have no availability data
  };
}

function formatAddress(address: RestaurantDto["address"]): string {
  return [address?.street, address?.city, address?.country?.name]
    .filter(Boolean)
    .join(", ");
}

export function mapRestaurant(
  dto: RestaurantDto,
  now: Date = new Date(),
): Restaurant {
  return {
    name: dto.name,
    address: formatAddress(dto.address),
    burgers: (dto.offered_burgers ?? []).map((b) => mapBurger(b, now)),
    drinks: (dto.offered_drinks ?? []).map(mapDrink),
  };
}

import type { RestaurantDto } from "./dto";
import type { MenuItem, Restaurant } from "./models";
import { mapRestaurant } from "./mapper";

const RESTAURANT_URL =
  "https://ahoi-production-bucket-public.s3.eu-central-1.amazonaws.com/challenge/assets/restaurant.json";

export async function getRestaurant(): Promise<Restaurant> {
  const res = await fetch(RESTAURANT_URL, { next: { revalidate: 300 } });

  if (!res.ok) {
    throw new Error(`Failed to load restaurant data (HTTP ${res.status})`);
  }

  const data: unknown = await res.json();
  if (typeof data !== "object" || data === null) {
    throw new Error("Unexpected restaurant data: not a JSON object");
  }

  // Only the top-level shape is checked here; the mapper validates each field.
  return mapRestaurant(data as RestaurantDto);
}

export async function getMenuItem(
  kind: MenuItem["kind"],
  id: string,
): Promise<MenuItem | undefined> {
  const restaurant = await getRestaurant();
  const items: MenuItem[] =
    kind === "burger" ? restaurant.burgers : restaurant.drinks;
  return items.find((item) => item.id === id);
}

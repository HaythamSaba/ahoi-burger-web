// Domain models used by the UI. Consistent, normalized, no API quirks.

interface MenuItemBase {
  id: string;
  name: string;
  description?: string;
  priceUsd?: number;
  imageUrl?: string;
  allergens: string[]; // always an array, never undefined
  isAvailable: boolean;
}

export interface Burger extends MenuItemBase {
  kind: "burger";
  weightGrams?: number;
  vegetarian?: boolean;
  ingredients: string[]; // from "tags", shown as "Special ingredients"
}

export interface Drink extends MenuItemBase {
  kind: "drink";
}

export type MenuItem = Burger | Drink;

export interface Restaurant {
  name: string;
  address: string;
  burgers: Burger[];
  drinks: Drink[];
}
export interface RestaurantDto {
  name: string;
  address?: AddressDto;
  offered_burgers?: BurgerDto[];
  offered_drinks?: DrinkDto[];
}

export interface AddressDto {
  street?: string;
  city?: string;
  country?: {
    country_code?: string;
    name?: string;
  };
}

export interface BurgerDto {
  name: string;
  description?: string;
  weight_grams?: number;
  price_usd?: number;
  info?: {
    in_stock?: boolean;
    vegetarian?: boolean;
    allergens_contained_in?: string[];
    availableSince?: number; // Unix timestamp in milliseconds
    available_until?: string; // ISO 8601 date string
    img?: string;
  };
  tags?: string[];
}

export interface DrinkDto {
  name: string;
  description?: string;
  price?: number; // currency not specified, assumed USD
  allergens?: string[];
  img?: string;
}
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenuItem, getRestaurant } from "@/lib/api";
import { titleCase } from "@/lib/format";
import { MenuItemDetail } from "@/components/MenuItemDetail";

type Props = { params: Promise<{ id: string }> };

/** Pre-renders every drink at build time; new drinks are rendered on demand. */
export async function generateStaticParams() {
  const { drinks } = await getRestaurant();
  return drinks.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getMenuItem("drink", id);
  return {
    title: item
      ? `${titleCase(item.name)} | Ahoi Burger!`
      : "Not found | Ahoi Burger!",
  };
}

export default async function DrinkPage({ params }: Props) {
  const { id } = await params;
  const [restaurant, item] = await Promise.all([
    getRestaurant(),
    getMenuItem("drink", id),
  ]);

  if (!item) notFound();

  return <MenuItemDetail item={item} restaurantName={restaurant.name} />;
}

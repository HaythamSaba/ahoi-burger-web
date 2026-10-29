import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenuItem, getRestaurant } from "@/lib/api";
import { MenuItemDetail } from "@/components/MenuItemDetail";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getMenuItem("burger", id);
  return {
    title: item ? `${item.name} | Ahoi Burger!` : "Not found | Ahoi Burger!",
  };
}

export default async function BurgerPage({ params }: Props) {
  const { id } = await params;
  const [restaurant, item] = await Promise.all([
    getRestaurant(),
    getMenuItem("burger", id),
  ]);

  if (!item) notFound();

  return <MenuItemDetail item={item} restaurantName={restaurant.name} />;
}

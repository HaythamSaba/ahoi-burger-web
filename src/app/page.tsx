import { getRestaurant } from "./lib/api";

export default async function Home() {
  const restaurant = await getRestaurant();
  return <pre className="p-4 text-xs">{JSON.stringify(restaurant, null, 2)}</pre>;
}
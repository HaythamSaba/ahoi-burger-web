import { getRestaurant } from "@/lib/api";
import { BurgerCard } from "@/components/BurgerCard";
import { DrinkCard } from "@/components/DrinkCard";

export default async function Home() {
  const { name, address, burgers, drinks } = await getRestaurant();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{name}</h1>
        {address && <p className="mt-1 text-lg">{address}</p>}
      </header>

      {burgers.length > 0 && (
        <section aria-labelledby="burgers-heading" className="mb-10">
          <h2 id="burgers-heading" className="mb-3 text-2xl font-bold">
            Burgers
          </h2>
          <ul className="grid gap-5 md:grid-cols-2">
            {burgers.map((burger, index) => (
              <li key={burger.id}>
                <BurgerCard burger={burger} preload={index === 0} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {drinks.length > 0 && (
        <section aria-labelledby="drinks-heading">
          <h2 id="drinks-heading" className="mb-3 text-2xl font-bold">
            Drinks
          </h2>
          <ul className="-mx-4 flex snap-x gap-4 scrollbar-none overflow-x-auto px-4 py-1 sm:-mx-6 sm:px-6">
            {drinks.map((drink) => (
              <li key={drink.id}>
                <DrinkCard drink={drink} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

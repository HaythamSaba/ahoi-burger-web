import Image from "next/image";
import Link from "next/link";
import type { MenuItem } from "@/lib/models";
import { capitalize, formatPrice, formatWeight, titleCase } from "@/lib/format";

interface Stat {
  label: string;
  value: string;
}

/** Builds the stats row from whatever data the item actually has. */
function getStats(item: MenuItem): Stat[] {
  const stats: Stat[] = [];

  const price = formatPrice(item.priceUsd);
  if (price) stats.push({ label: "Price", value: price });

  if (item.kind === "burger") {
    const weight = formatWeight(item.weightGrams);
    if (weight) stats.push({ label: "Weight", value: weight });

    if (item.vegetarian !== undefined) {
      stats.push({
        label: "Vegetarian",
        value: item.vegetarian ? "Yes" : "No",
      });
    }
  }

  return stats;
}

interface Props {
  item: MenuItem;
  restaurantName: string;
}

export function MenuItemDetail({ item, restaurantName }: Props) {
  const name = titleCase(item.name);
  const stats = getStats(item);
  const ingredients =
    item.kind === "burger" ? item.ingredients.map(capitalize) : [];

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/90 backdrop-blur">
        <div className="mx-auto grid h-14 max-w-3xl grid-cols-[1fr_minmax(0,auto)_1fr] items-center px-4">
          <nav className="min-w-0 justify-self-start">
            <Link
              href="/"
              className="flex items-center gap-1 rounded text-sky-400 hover:text-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              <span aria-hidden className="text-2xl leading-none">
                ‹
              </span>
              <span className="truncate">{restaurantName}</span>
            </Link>
          </nav>
          <h1 className="truncate text-center text-lg font-semibold">{name}</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        {!item.isAvailable && (
          <p className="mb-4 rounded-lg bg-neutral-100 px-4 py-3 text-center font-medium">
            Currently not available
          </p>
        )}

        {item.imageUrl && (
          <div className="relative aspect-3/2 overflow-hidden rounded-xl bg-neutral-100">
            <Image
              src={item.imageUrl}
              alt={name}
              fill
              preload
              sizes="(min-width: 768px) 768px, 100vw"
              className={`object-cover ${item.isAvailable ? "" : "grayscale"}`}
            />
          </div>
        )}

        {stats.length > 0 && (
          <dl className="flex justify-between gap-4 border-b border-neutral-200 py-5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col-reverse items-center"
              >
                <dt className="text-sm text-neutral-500">{stat.label}</dt>
                <dd className="text-2xl font-bold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {item.description && <p className="mt-6 text-lg">{item.description}</p>}

        {ingredients.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-neutral-500">
              Special ingredients
            </h2>
            <p className="mt-1 text-lg">{ingredients.join(", ")}</p>
          </section>
        )}

        {item.allergens.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-neutral-500">Allergens</h2>
            <p className="mt-2 rounded-lg bg-orange-100 px-4 py-3 text-lg">
              {item.allergens.join(", ")}
            </p>
          </section>
        )}
      </main>
    </>
  );
}

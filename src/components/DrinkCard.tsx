import Image from "next/image";
import Link from "next/link";
import type { Drink } from "@/lib/models";
import { titleCase } from "@/lib/format";

export function DrinkCard({ drink }: { drink: Drink }) {
  return (
    <Link
      href={`/drinks/${drink.id}`}
      className="group block w-40 shrink-0 snap-start rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 sm:w-48"
    >
      <div className="relative aspect-9/8 overflow-hidden rounded-xl bg-neutral-100">
        {drink.imageUrl && (
          <Image
            src={drink.imageUrl}
            alt=""
            fill
            sizes="192px"
            className="object-cover transition-transform group-hover:scale-105"
          />
        )}
      </div>
      <p className="mt-2 text-sm">{titleCase(drink.name)}</p>
    </Link>
  );
}

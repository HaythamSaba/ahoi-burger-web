import Image from "next/image";
import Link from "next/link";
import type { Burger } from "@/lib/models";
import { formatPrice, formatWeight } from "@/lib/format";

interface Props {
  burger: Burger;
  /** Preload the image; use for the first card, which is the LCP element. */
  preload?: boolean;
}

export function BurgerCard({ burger, preload = false }: Props) {
  const price = formatPrice(burger.priceUsd);
  const weight = formatWeight(burger.weightGrams);
  const unavailable = !burger.isAvailable;

  return (
    <Link
      href={`/burgers/${burger.id}`}
      className="block overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
    >
      <div className="relative aspect-14/5 bg-neutral-100">
        {burger.imageUrl && (
          <Image
            src={burger.imageUrl}
            alt=""
            fill
            preload={preload}
            sizes="(min-width: 768px) 480px, 100vw"
            className={`object-cover ${unavailable ? "grayscale" : ""}`}
          />
        )}

        {unavailable ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-neutral-100/95 px-8 py-1.5 font-medium">
              Currently not available
            </span>
          </div>
        ) : (
          price && (
            <span className="absolute bottom-2.5 right-2.5 rounded-full bg-sky-400 px-3 py-1 font-semibold text-white">
              {price}
            </span>
          )
        )}
      </div>

      <div
        className={`flex items-baseline justify-between gap-4 px-5 py-4 ${unavailable ? "line-through" : ""}`}
      >
        <h3 className="text-xl font-semibold">{burger.name}</h3>
        {weight && <span className="shrink-0 text-neutral-500">{weight}</span>}
      </div>
    </Link>
  );
}

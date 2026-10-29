// Pure display helpers. Return undefined when there is nothing to show,
// so the UI can simply skip the element.

export function formatPrice(priceUsd?: number): string | undefined {
  return priceUsd === undefined ? undefined : `${priceUsd.toFixed(2)} USD`;
}

export function formatWeight(grams?: number): string | undefined {
  return grams === undefined ? undefined : `${grams} g`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "Long island ice tea" -> "Long Island Ice Tea" (matches the mockup). */
export function titleCase(text: string): string {
  return text.split(" ").map(capitalize).join(" ");
}

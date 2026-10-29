import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-neutral-600">
        This page doesn&apos;t exist, or the item is no longer on the menu.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sky-400 hover:text-sky-500"
      >
        ‹ Back to menu
      </Link>
    </main>
  );
}

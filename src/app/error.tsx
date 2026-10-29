"use client";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: Props) {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-neutral-600">
        We couldn&apos;t load the menu. Please check your connection and try
        again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-sky-400 px-6 py-2 font-semibold text-white hover:bg-sky-500"
      >
        Try again
      </button>
    </main>
  );
}

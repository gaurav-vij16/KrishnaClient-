'use client';
import { Button } from '@/components/ui/button';
export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto grid min-h-screen max-w-xl place-content-center px-5 text-center">
      <h1 className="text-2xl font-black text-stone-950">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-stone-600">
        Please try again. Your saved orders are safe.
      </p>
      <Button className="mx-auto mt-5" variant="primary" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}

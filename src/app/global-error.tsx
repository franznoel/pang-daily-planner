"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
        {error.digest ? <p>Digest: {error.digest}</p> : null}
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}

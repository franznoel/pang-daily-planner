import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Page not found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <p>
        <Link href="/">Go back home</Link>
      </p>
    </main>
  );
}

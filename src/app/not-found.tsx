import Link from "next/link";

export default function NotFound() {
  return (
    <main className="content-shell" style={{ padding: "120px 20px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "36px", marginBottom: "16px" }}>
        Page not found
      </h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: "32px" }}>
        We couldn’t find the page you were looking for.
      </p>
      <Link href="/" className="button button-dark">
        Return to shop
      </Link>
    </main>
  );
}

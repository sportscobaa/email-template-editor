import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="h-nav">
      <Link href="/" className="h-logo">
        <span className="h-logo-mark" aria-hidden>
          ✉
        </span>
        Email Template Editor
      </Link>
      <nav className="h-nav-links" aria-label="Main">
        <Link href="/#features">Features</Link>
        <Link href="/#blocks">Blocks</Link>
        <Link href="/#code">API</Link>
        <Link href="/pricing">Pricing</Link>
      </nav>
      <Link href="/editor" className="h-btn h-btn-light h-btn-sm">
        Open editor
      </Link>
    </header>
  );
}

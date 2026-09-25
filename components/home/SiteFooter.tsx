import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="h-footer">
      <span>Email Template Editor</span>
      <span className="h-footer-links">
        <Link href="/editor">Editor</Link>
        <Link href="/pricing">Pricing</Link>
        <span>Built with Next.js</span>
      </span>
    </footer>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import PricingCards from "@/components/home/PricingCards";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import { PRICING_FAQ } from "@/lib/pricing";
import "../home.css";

export const metadata: Metadata = {
  title: "Pricing · Email Template Editor",
  description: "The email editor is free: every block, unlimited HTML exports, no sign-up and no watermark.",
};

const FREE_FACTS = [
  { value: "$0", label: "to use the full editor" },
  { value: "0", label: "sign-ups or credit cards" },
  { value: "∞", label: "emails and HTML exports" },
  { value: "No", label: "watermark in your HTML" },
];

export default function PricingPage() {
  return (
    <div className="home">
      <div className="h-glow" aria-hidden />
      <SiteHeader />

      <main>
        <section className="h-hero h-hero-short">
          <p className="h-badge">
            <span className="h-badge-dot" aria-hidden />
            Pricing
          </p>
          <h1 className="h-title">
            It&apos;s free.
            <br />
            <span className="h-title-fade">No catch.</span>
          </h1>
          <p className="h-lead">
            Build as many emails as you want and export the HTML. You don&apos;t need an account or a card, and there&apos;s no
            trial that runs out.
          </p>
          <ul className="h-facts">
            {FREE_FACTS.map((f) => (
              <li key={f.label}>
                <strong>{f.value}</strong>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="h-section h-section-tight">
          <PricingCards />
          <p className="h-pricing-footnote">
            Pro and Team are planned and can&apos;t be bought yet. Prices may change before launch.
          </p>
        </section>

        <section className="h-section" id="faq">
          <p className="h-eyebrow">FAQ</p>
          <h2 className="h-h2">Questions about pricing</h2>
          <div className="h-faq">
            {PRICING_FAQ.map((item) => (
              <details key={item.q} className="h-faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="h-final">
          <h2 className="h-h2">Start building for free</h2>
          <p className="h-sub">Opens in your browser in a second.</p>
          <Link href="/editor" className="h-btn h-btn-light">
            Open the editor
            <span aria-hidden>→</span>
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

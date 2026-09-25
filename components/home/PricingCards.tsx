import Link from "next/link";
import { PLANS } from "@/lib/pricing";

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Free is the only plan that exists today, so it is the one that stands out.
 * Paid plans are shown dimmed as "coming soon" with no way to buy them.
 */
export default function PricingCards() {
  return (
    <div className="h-pricing">
      {PLANS.map((plan) => (
        <article
          key={plan.id}
          className={plan.available ? "h-plan h-plan-free" : "h-plan h-plan-soon"}
          aria-label={`${plan.name} plan${plan.available ? "" : ", coming soon"}`}
        >
          <div className="h-plan-head">
            <h3>{plan.name}</h3>
            <span className={plan.available ? "h-pill h-pill-live" : "h-pill"}>
              {plan.available ? "Available now" : "Coming soon"}
            </span>
          </div>
          <p className="h-plan-price">
            <strong>{plan.price}</strong>
            <span>{plan.period}</span>
          </p>
          <p className="h-plan-tagline">{plan.tagline}</p>
          {plan.available ? (
            <Link href="/editor" className="h-btn h-btn-light h-plan-cta">
              Start building for free
              <span aria-hidden>→</span>
            </Link>
          ) : (
            <p className="h-plan-cta h-plan-cta-off">Not available yet</p>
          )}
          <ul className="h-plan-features">
            {plan.features.map((f) => (
              <li key={f}>
                <Check />
                {f}
              </li>
            ))}
          </ul>
          {plan.available ? <p className="h-plan-note">No account. No credit card. No time limit.</p> : null}
        </article>
      ))}
    </div>
  );
}

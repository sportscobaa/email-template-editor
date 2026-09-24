import type { Metadata } from "next";
import Link from "next/link";
import CodeTabs, { type CodeTab } from "@/components/home/CodeTabs";
import { BLOCK_META, BLOCK_TYPES, DEFAULT_SETTINGS, createBlock, starterTemplate } from "@/lib/email/blocks";
import { renderBlockRow, renderEmail, resolveSettings } from "@/lib/email/renderer";
import "./home.css";

export const metadata: Metadata = {
  title: "Email Template Editor · Drag, drop, export HTML",
  description:
    "Build responsive emails by dragging blocks onto a canvas, then export HTML that works in Gmail, Outlook and Apple Mail.",
};

// The hero preview skips external placeholder images so it never shows a broken image.
function heroPreviewHtml(): string {
  const template = starterTemplate();
  template.blocks = template.blocks.filter((b) => b.type !== "image");
  for (const block of template.blocks) {
    if (block.type === "columns") {
      block.props.leftImage = "";
      block.props.rightImage = "";
    }
  }
  return renderEmail(template);
}

const previewHtml = heroPreviewHtml();

function exampleCode(): CodeTab[] {
  const heading = createBlock("heading");
  const button = createBlock("button");
  if (heading.type === "heading") heading.props.text = "Welcome aboard";
  if (button.type === "button") {
    button.props.text = "Get started";
    button.props.url = "https://example.com";
  }
  const settings = resolveSettings(DEFAULT_SETTINGS);
  const template = {
    settings: { title: "Welcome" },
    blocks: [
      { type: "heading", props: { text: "Welcome aboard" } },
      { type: "button", props: { text: "Get started", url: "https://example.com" } },
    ],
  };

  return [
    {
      id: "api",
      label: "API",
      filename: "terminal",
      code: `curl -X POST http://localhost:3000/api/render \\
  -H "Content-Type: application/json" \\
  -d @welcome.json > welcome.html`,
    },
    { id: "json", label: "Template", filename: "welcome.json", code: JSON.stringify(template, null, 2) },
    {
      id: "html",
      label: "HTML output",
      filename: "welcome.html (excerpt)",
      code: [renderBlockRow(heading, settings), renderBlockRow(button, settings)]
        .join("\n")
        .replace(/><(?!\/?(a|strong|em|br)\b)/g, ">\n<"),
    },
  ];
}

const FEATURES = [
  {
    title: "Drag and drop",
    body: "Pull blocks from the sidebar onto the canvas and drag them to reorder. Click to add on touch screens.",
    icon: "M8 7h.01M8 12h.01M8 17h.01M16 7h.01M16 12h.01M16 17h.01",
  },
  {
    title: "Works in every inbox",
    body: "Table layout, inline styles and Outlook conditionals, so the email looks right in Gmail, Outlook and Apple Mail.",
    icon: "M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  },
  {
    title: "Responsive by default",
    body: "Content scales down on phones and columns stack. Check it with the built-in desktop and mobile preview.",
    icon: "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2",
  },
  {
    title: "Edit everything",
    body: "Text, colors, alignment, spacing, fonts and width for every block and the whole email.",
    icon: "M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4",
  },
  {
    title: "Undo, autosave, JSON",
    body: "Unlimited undo while you edit, autosave in the browser, and templates you can save and import as JSON.",
    icon: "M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
  },
  {
    title: "HTML from an API",
    body: "POST a template to /api/render and get the finished HTML back, ready for your sending service.",
    icon: "M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12",
  },
];

const STEPS = [
  { n: "01", title: "Drag", body: "Drop headings, images, buttons and columns onto the canvas." },
  { n: "02", title: "Customize", body: "Select a block and change its text, colors and spacing." },
  { n: "03", title: "Export", body: "Copy or download the HTML and paste it into any email tool." },
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="home">
      <div className="h-glow" aria-hidden />

      <header className="h-nav">
        <Link href="/" className="h-logo">
          <span className="h-logo-mark" aria-hidden>
            ✉
          </span>
          Email Template Editor
        </Link>
        <nav className="h-nav-links" aria-label="Main">
          <a href="#features">Features</a>
          <a href="#blocks">Blocks</a>
          <a href="#code">API</a>
        </nav>
        <Link href="/editor" className="h-btn h-btn-light h-btn-sm">
          Open editor
        </Link>
      </header>

      <main>
        <section className="h-hero">
          <p className="h-badge">
            <span className="h-badge-dot" aria-hidden />
            Drag-and-drop email builder · Built with Next.js
          </p>
          <h1 className="h-title">
            Emails you build
            <br />
            <span className="h-title-fade">by dragging blocks</span>
          </h1>
          <p className="h-lead">
            A visual editor for email templates. Drag blocks onto the canvas, style them, and export HTML that works in
            every major inbox.
          </p>
          <div className="h-cta">
            <Link href="/editor" className="h-btn h-btn-light">
              Start building
              <span aria-hidden>→</span>
            </Link>
            <a href="#code" className="h-btn h-btn-ghost">
              See the HTML output
            </a>
          </div>

          <div className="h-showcase">
            <div className="h-window">
              <div className="h-window-bar">
                <span />
                <span />
                <span />
                <p>Welcome to our newsletter</p>
              </div>
              <div className="h-window-body">
                <aside className="h-window-blocks" aria-hidden>
                  {BLOCK_TYPES.slice(0, 6).map((type) => (
                    <div key={type} className="h-mini-block">
                      <span>{BLOCK_META[type].icon}</span>
                      {BLOCK_META[type].label}
                    </div>
                  ))}
                  <div className="h-drag-chip">
                    <span>⬭</span>Button
                  </div>
                </aside>
                <iframe className="h-window-email" title="Example email built with the editor" sandbox="" srcDoc={previewHtml} loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <section className="h-section" id="features">
          <p className="h-eyebrow">Features</p>
          <h2 className="h-h2">Everything you need to ship an email</h2>
          <p className="h-sub">No HTML tables to write by hand and no email client quirks to memorize.</p>
          <div className="h-features">
            {FEATURES.map((f) => (
              <article key={f.title} className="h-card">
                <div className="h-card-icon">
                  <Icon d={f.icon} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="h-section" id="blocks">
          <p className="h-eyebrow">Blocks</p>
          <h2 className="h-h2">{BLOCK_TYPES.length} blocks to build with</h2>
          <p className="h-sub">Each one has its own settings, and each one renders to email-safe HTML.</p>
          <ul className="h-blocks">
            {BLOCK_TYPES.map((type) => (
              <li key={type} className="h-block">
                <span className="h-block-icon" aria-hidden>
                  {BLOCK_META[type].icon}
                </span>
                <span>
                  <strong>{BLOCK_META[type].label}</strong>
                  <small>{BLOCK_META[type].description}</small>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="h-section">
          <p className="h-eyebrow">How it works</p>
          <h2 className="h-h2">From blank canvas to inbox in three steps</h2>
          <ol className="h-steps">
            {STEPS.map((s) => (
              <li key={s.n} className="h-step">
                <span className="h-step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="h-section h-split" id="code">
          <div>
            <p className="h-eyebrow">For developers</p>
            <h2 className="h-h2 h-left">Templates in, HTML out</h2>
            <p className="h-sub h-left">
              Every template is plain JSON. Save it from the editor, keep it in your repo, and render it to HTML from
              your backend with a single request.
            </p>
            <ul className="h-checks">
              <li>Same renderer as the editor, so the output matches what you designed</li>
              <li>Text is escaped and script links are blocked</li>
              <li>Missing fields fall back to sensible defaults</li>
            </ul>
          </div>
          <CodeTabs tabs={exampleCode()} />
        </section>

        <section className="h-final">
          <h2 className="h-h2">Build your next email</h2>
          <p className="h-sub">Opens in your browser. No account needed.</p>
          <Link href="/editor" className="h-btn h-btn-light">
            Open the editor
            <span aria-hidden>→</span>
          </Link>
        </section>
      </main>

      <footer className="h-footer">
        <span>Email Template Editor</span>
        <span>Built with Next.js</span>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";

export interface CodeTab {
  id: string;
  label: string;
  filename: string;
  code: string;
}

export default function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const [copied, setCopied] = useState(false);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tab.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the code is still selectable.
    }
  };

  return (
    <div className="h-code">
      <div className="h-code-bar">
        <div className="h-code-tabs" role="tablist" aria-label="Code examples">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === tab.id}
              className={t.id === tab.id ? "active" : ""}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className="h-code-copy" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="h-code-file">{tab.filename}</div>
      <pre className="h-code-body" role="tabpanel">
        <code>{tab.code}</code>
      </pre>
    </div>
  );
}

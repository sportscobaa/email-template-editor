"use client";

import dynamic from "next/dynamic";

// The editor reads localStorage and generates random block ids on first render,
// so it is rendered on the client only to avoid hydration mismatches.
const EmailEditor = dynamic(() => import("./EmailEditor"), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading editor…</div>,
});

export default function EditorLoader() {
  return <EmailEditor />;
}

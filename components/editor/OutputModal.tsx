"use client";

import { useEffect, useRef, useState } from "react";
import { downloadFile, slugify } from "./download";

export type OutputTab = "preview" | "html";

interface OutputModalProps {
  html: string;
  title: string;
  initialTab: OutputTab;
  onClose: () => void;
}

export default function OutputModal({ html, title, initialTab, onClose }: OutputModalProps) {
  const [tab, setTab] = useState<OutputTab>(initialTab);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(html);
    } catch {
      // Clipboard API can be blocked (e.g. non-secure context); fall back to selection.
      setTab("html");
      requestAnimationFrame(() => {
        codeRef.current?.select();
        document.execCommand("copy");
      });
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Email output" tabIndex={-1} ref={dialogRef}>
        <div className="modal-header">
          <div className="segmented">
            <button type="button" className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}>
              Preview
            </button>
            <button type="button" className={tab === "html" ? "active" : ""} onClick={() => setTab("html")}>
              HTML code
            </button>
          </div>
          {tab === "preview" ? (
            <div className="segmented">
              <button type="button" className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")}>
                Desktop
              </button>
              <button type="button" className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")}>
                Mobile
              </button>
            </div>
          ) : (
            <span className="muted">{(html.length / 1024).toFixed(1)} KB</span>
          )}
          <div className="modal-actions">
            <button type="button" className="btn" onClick={copy}>
              {copied ? "Copied ✓" : "Copy HTML"}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => downloadFile(`${slugify(title)}.html`, html, "text/html")}
            >
              Download .html
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className="modal-body">
          {tab === "preview" ? (
            <div className="preview-stage">
              <iframe
                title="Email preview"
                className={device === "mobile" ? "preview-frame mobile" : "preview-frame"}
                sandbox=""
                srcDoc={html}
              />
            </div>
          ) : (
            <textarea ref={codeRef} className="code-output" readOnly spellCheck={false} value={html} />
          )}
        </div>
      </div>
    </div>
  );
}

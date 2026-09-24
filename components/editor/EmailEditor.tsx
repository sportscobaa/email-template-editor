"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { normalizeTemplate, starterTemplate } from "@/lib/email/blocks";
import { editorReducer, initEditorState } from "@/lib/email/editorState";
import { renderEmail } from "@/lib/email/renderer";
import type { BlockType, EmailTemplate } from "@/lib/email/types";
import Canvas from "./Canvas";
import { downloadFile, slugify } from "./download";
import OutputModal, { type OutputTab } from "./OutputModal";
import Palette from "./Palette";
import PropertiesPanel from "./PropertiesPanel";

const STORAGE_KEY = "email-template-editor:v1";

function loadSavedTemplate(): EmailTemplate {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeTemplate(JSON.parse(raw)) ?? starterTemplate();
  } catch {
    // Storage may be unavailable (private mode) or hold bad data.
  }
  return starterTemplate();
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

export default function EmailEditor() {
  const [state, dispatch] = useReducer(editorReducer, undefined, () => initEditorState(loadSavedTemplate()));
  const [output, setOutput] = useState<OutputTab | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { template, selectedId } = state;

  const selectedBlock = useMemo(
    () => template.blocks.find((b) => b.id === selectedId) ?? null,
    [template.blocks, selectedId],
  );
  const html = useMemo(() => (output ? renderEmail(template) : ""), [output, template]);

  // Autosave (debounced) so a refresh doesn't lose work.
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
      } catch {
        // ignore quota / privacy errors
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [template]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (output) return;
      const mod = e.metaKey || e.ctrlKey;
      const typing = isTypingTarget(e.target);
      if (mod && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      } else if (mod && e.key.toLowerCase() === "y" && !typing) {
        e.preventDefault();
        dispatch({ type: "redo" });
      } else if (mod && e.key.toLowerCase() === "d" && selectedId && !typing) {
        e.preventDefault();
        dispatch({ type: "duplicate", id: selectedId });
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !typing) {
        e.preventDefault();
        dispatch({ type: "remove", id: selectedId });
      } else if (e.key === "Escape" && !typing) {
        dispatch({ type: "select", id: null });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [output, selectedId]);

  const addBlock = useCallback(
    (blockType: BlockType) => {
      // Click-to-add inserts after the selected block, otherwise at the end.
      const index = selectedId ? template.blocks.findIndex((b) => b.id === selectedId) + 1 : undefined;
      dispatch({ type: "add", blockType, index: index || undefined });
    },
    [selectedId, template.blocks],
  );

  const exportJson = () => {
    downloadFile(`${slugify(template.settings.title)}.json`, JSON.stringify(template, null, 2), "application/json");
  };

  const importJson = async (file: File) => {
    try {
      const parsed = normalizeTemplate(JSON.parse(await file.text()));
      if (!parsed) throw new Error("invalid");
      dispatch({ type: "load", template: parsed });
      setNotice(`Imported ${file.name}`);
    } catch {
      setNotice("That file is not a valid template JSON.");
    }
  };

  const reset = (mode: "starter" | "blank") => {
    const message = mode === "blank" ? "Remove all blocks?" : "Replace the current email with the starter template?";
    if (!window.confirm(message)) return;
    const next = starterTemplate();
    if (mode === "blank") next.blocks = [];
    dispatch({ type: "load", template: next });
  };

  const closeOutput = useCallback(() => setOutput(null), []);

  return (
    <div className="editor">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            ✉
          </span>
          <span className="brand-name">Email Template Editor</span>
        </div>
        <div className="topbar-group">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => dispatch({ type: "undo" })}
            disabled={!state.past.length}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => dispatch({ type: "redo" })}
            disabled={!state.future.length}
            title="Redo (Ctrl+Shift+Z)"
          >
            ↷ Redo
          </button>
          <span className="divider-v" />
          <button type="button" className="btn btn-ghost" onClick={() => reset("blank")}>
            Clear
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => reset("starter")}>
            Starter
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
            Import JSON
          </button>
          <button type="button" className="btn btn-ghost" onClick={exportJson}>
            Save JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importJson(file);
              e.target.value = "";
            }}
          />
        </div>
        <div className="topbar-group">
          <button type="button" className="btn" onClick={() => setOutput("preview")}>
            Preview
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setOutput("html")}>
            Get HTML
          </button>
        </div>
      </header>

      <aside className="sidebar sidebar-left" aria-label="Blocks">
        <h2 className="panel-title">Blocks</h2>
        <Palette onAdd={addBlock} />
      </aside>

      <main className="workspace" aria-label="Email canvas">
        <Canvas template={template} selectedId={selectedId} dispatch={dispatch} />
      </main>

      <aside className="sidebar sidebar-right" aria-label="Properties">
        <PropertiesPanel key={selectedBlock?.id ?? "settings"} block={selectedBlock} settings={template.settings} dispatch={dispatch} />
      </aside>

      {output ? (
        <OutputModal html={html} title={template.settings.title} initialTab={output} onClose={closeOutput} />
      ) : null}
      {notice ? (
        <div className="toast" role="status">
          {notice}
        </div>
      ) : null}
    </div>
  );
}

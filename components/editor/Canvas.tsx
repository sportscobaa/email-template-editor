"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { BLOCK_META } from "@/lib/email/blocks";
import type { EditorAction } from "@/lib/email/editorState";
import { renderBlockRow, resolveSettings } from "@/lib/email/renderer";
import type { Block, EmailSettings, EmailTemplate } from "@/lib/email/types";
import { isBlockDrag, readDragPayload, setDragPayload } from "./dnd";

interface CanvasProps {
  template: EmailTemplate;
  selectedId: string | null;
  dispatch: React.Dispatch<EditorAction>;
}

/**
 * The canvas shows exported markup directly in the editor page, so strip
 * anything executable (event handlers, scripts, javascript: links) first.
 * The exported HTML itself is left untouched.
 */
function sanitizeForCanvas(html: string): string {
  if (typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(`<table><tbody>${html}</tbody></table>`, "text/html");
  doc.querySelectorAll("script, iframe, object, embed, link, meta, base, form").forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      else if ((name === "href" || name === "src") && /^\s*(javascript|vbscript):/i.test(attr.value)) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.querySelector("tbody")?.innerHTML ?? "";
}

interface CanvasBlockProps {
  block: Block;
  index: number;
  count: number;
  settings: EmailSettings;
  selected: boolean;
  dropBefore: boolean;
  dropAfter: boolean;
  dragging: boolean;
  dispatch: React.Dispatch<EditorAction>;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

const CanvasBlock = memo(function CanvasBlock({
  block,
  index,
  count,
  settings,
  selected,
  dropBefore,
  dropAfter,
  dragging,
  dispatch,
  onDragStart,
  onDragEnd,
}: CanvasBlockProps) {
  const html = useMemo(() => sanitizeForCanvas(renderBlockRow(block, settings)), [block, settings]);
  const classes = ["canvas-block"];
  if (selected) classes.push("selected");
  if (dropBefore) classes.push("drop-before");
  if (dropAfter) classes.push("drop-after");
  if (dragging) classes.push("dragging");

  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div
      className={classes.join(" ")}
      data-block-id={block.id}
      draggable
      onDragStart={(e) => {
        setDragPayload(e, { kind: "move", id: block.id });
        onDragStart(block.id);
      }}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        // Links inside the preview should not navigate away from the editor.
        if ((e.target as HTMLElement).closest("a")) e.preventDefault();
        dispatch({ type: "select", id: block.id });
      }}
    >
      <div className="block-toolbar" onClick={(e) => e.stopPropagation()}>
        <span className="block-handle" title="Drag to reorder">
          ⠿ {BLOCK_META[block.type].label}
        </span>
        <span className="block-actions">
          <button type="button" title="Move up" disabled={index === 0} onClick={stop(() => dispatch({ type: "moveBy", id: block.id, delta: -1 }))}>
            ↑
          </button>
          <button
            type="button"
            title="Move down"
            disabled={index === count - 1}
            onClick={stop(() => dispatch({ type: "moveBy", id: block.id, delta: 1 }))}
          >
            ↓
          </button>
          <button type="button" title="Duplicate" onClick={stop(() => dispatch({ type: "duplicate", id: block.id }))}>
            ⧉
          </button>
          <button type="button" title="Delete" className="danger" onClick={stop(() => dispatch({ type: "remove", id: block.id }))}>
            🗑
          </button>
        </span>
      </div>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} className="block-table">
        <tbody dangerouslySetInnerHTML={{ __html: html }} />
      </table>
    </div>
  );
});

export default function Canvas({ template, selectedId, dispatch }: CanvasProps) {
  const settings = useMemo(() => resolveSettings(template.settings), [template.settings]);
  const listRef = useRef<HTMLDivElement>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const blocks = template.blocks;
  const handleBlockDragEnd = useCallback(() => {
    setDraggingId(null);
    setDropIndex(null);
  }, []);

  const indexFromPointer = (clientY: number): number => {
    const els = listRef.current?.querySelectorAll<HTMLElement>(":scope > .canvas-block") ?? [];
    for (let i = 0; i < els.length; i++) {
      const rect = els[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return els.length;
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isBlockDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = draggingId ? "move" : "copy";
    const index = indexFromPointer(e.clientY);
    if (index !== dropIndex) setDropIndex(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    const payload = readDragPayload(e);
    const index = dropIndex ?? indexFromPointer(e.clientY);
    setDropIndex(null);
    setDraggingId(null);
    if (!payload) return;
    e.preventDefault();
    if (payload.kind === "new") dispatch({ type: "add", blockType: payload.blockType, index });
    else dispatch({ type: "move", id: payload.id, index });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const next = e.relatedTarget as Node | null;
    if (!next || !e.currentTarget.contains(next)) setDropIndex(null);
  };

  return (
    <div
      className="canvas-scroll"
      style={{ backgroundColor: settings.backgroundColor }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onClick={() => dispatch({ type: "select", id: null })}
    >
      <div
        ref={listRef}
        className={blocks.length ? "canvas" : "canvas empty"}
        style={{
          width: settings.contentWidth,
          backgroundColor: settings.contentBackground,
          fontFamily: settings.fontFamily,
          color: settings.textColor,
        }}
      >
        {blocks.length === 0 ? (
          <div className={dropIndex !== null ? "canvas-empty active" : "canvas-empty"}>
            <strong>Drag blocks here</strong>
            <span>or click a block on the left to add it</span>
          </div>
        ) : (
          blocks.map((block, i) => (
            <CanvasBlock
              key={block.id}
              block={block}
              index={i}
              count={blocks.length}
              settings={settings}
              selected={block.id === selectedId}
              dropBefore={dropIndex === i}
              dropAfter={dropIndex === blocks.length && i === blocks.length - 1}
              dragging={block.id === draggingId}
              dispatch={dispatch}
              onDragStart={setDraggingId}
              onDragEnd={handleBlockDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}

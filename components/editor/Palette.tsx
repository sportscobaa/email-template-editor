"use client";

import { BLOCK_META, BLOCK_TYPES } from "@/lib/email/blocks";
import type { BlockType } from "@/lib/email/types";
import { setDragPayload } from "./dnd";

interface PaletteProps {
  onAdd: (type: BlockType) => void;
}

export default function Palette({ onAdd }: PaletteProps) {
  return (
    <div className="palette">
      <p className="panel-hint">Drag a block onto the email, or click to add it.</p>
      <div className="palette-grid">
        {BLOCK_TYPES.map((type) => {
          const meta = BLOCK_META[type];
          return (
            <button
              key={type}
              type="button"
              className="palette-item"
              draggable
              onDragStart={(e) => setDragPayload(e, { kind: "new", blockType: type })}
              onClick={() => onAdd(type)}
              title={meta.description}
            >
              <span className="palette-icon" aria-hidden>
                {meta.icon}
              </span>
              <span className="palette-label">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import type { BlockType } from "@/lib/email/types";

/** Custom MIME type so drops from outside the editor (files, links) are ignored. */
export const DND_MIME = "application/x-email-block";

export type DragPayload = { kind: "new"; blockType: BlockType } | { kind: "move"; id: string };

export function setDragPayload(e: React.DragEvent, payload: DragPayload) {
  e.dataTransfer.setData(DND_MIME, JSON.stringify(payload));
  // Firefox won't start a drag without some data; text/plain also helps other browsers.
  e.dataTransfer.setData("text/plain", payload.kind === "new" ? payload.blockType : payload.id);
  e.dataTransfer.effectAllowed = payload.kind === "new" ? "copy" : "move";
}

export function readDragPayload(e: React.DragEvent): DragPayload | null {
  const raw = e.dataTransfer.getData(DND_MIME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DragPayload;
    if (parsed.kind === "new" || parsed.kind === "move") return parsed;
  } catch {
    // ignore malformed payloads
  }
  return null;
}

export function isBlockDrag(e: React.DragEvent): boolean {
  return e.dataTransfer.types.includes(DND_MIME);
}

import type { Block, BlockPropsMap, BlockType, EmailSettings, EmailTemplate } from "./types";

export const DEFAULT_SETTINGS: EmailSettings = {
  title: "My Email",
  preheader: "",
  backgroundColor: "#f4f4f5",
  contentBackground: "#ffffff",
  contentWidth: 600,
  fontFamily: "Arial, Helvetica, sans-serif",
  textColor: "#333333",
  linkColor: "#2563eb",
};

const section = { paddingY: 12, paddingX: 24, backgroundColor: "" };

export const BLOCK_DEFAULTS: BlockPropsMap = {
  heading: {
    ...section,
    paddingY: 16,
    text: "Your heading here",
    level: "h1",
    fontSize: 28,
    color: "",
    align: "center",
  },
  text: {
    ...section,
    text: "Write your message here. Use **bold**, *italic* and [links](https://example.com).",
    fontSize: 16,
    lineHeight: 1.6,
    color: "",
    align: "left",
  },
  image: {
    ...section,
    src: "https://placehold.co/1200x500/e2e8f0/475569/png?text=Your+Image",
    alt: "Image",
    link: "",
    width: 100,
    align: "center",
  },
  button: {
    ...section,
    paddingY: 16,
    text: "Click here",
    url: "https://example.com",
    buttonColor: "#2563eb",
    textColor: "#ffffff",
    fontSize: 16,
    borderRadius: 6,
    fullWidth: false,
    align: "center",
  },
  divider: { ...section, paddingY: 16, color: "#e5e7eb", thickness: 1 },
  spacer: { ...section, paddingY: 0, paddingX: 0, height: 32 },
  columns: {
    ...section,
    leftImage: "https://placehold.co/600x400/e2e8f0/475569/png?text=Left",
    leftText: "**Left column**\nA short description goes here.",
    rightImage: "https://placehold.co/600x400/e2e8f0/475569/png?text=Right",
    rightText: "**Right column**\nA short description goes here.",
    gap: 16,
    fontSize: 15,
    color: "",
  },
  social: {
    ...section,
    paddingY: 16,
    facebook: "https://facebook.com/",
    x: "https://x.com/",
    instagram: "https://instagram.com/",
    linkedin: "",
    youtube: "",
    website: "",
    pillColor: "#f3f4f6",
    pillTextColor: "#111827",
    align: "center",
  },
  footer: {
    ...section,
    paddingY: 24,
    text: "You are receiving this email because you signed up on our website.\n[Unsubscribe](https://example.com/unsubscribe)",
    fontSize: 12,
    color: "#9ca3af",
    align: "center",
  },
  html: { ...section, paddingY: 0, paddingX: 0, html: '<p style="margin:0;padding:12px 24px;">Custom HTML</p>' },
};

export const BLOCK_META: Record<BlockType, { label: string; icon: string; description: string }> = {
  heading: { label: "Heading", icon: "H", description: "Title text" },
  text: { label: "Text", icon: "¶", description: "Paragraph" },
  image: { label: "Image", icon: "▣", description: "Picture with optional link" },
  button: { label: "Button", icon: "⬭", description: "Call to action" },
  divider: { label: "Divider", icon: "─", description: "Horizontal line" },
  spacer: { label: "Spacer", icon: "↕", description: "Empty space" },
  columns: { label: "2 Columns", icon: "▥", description: "Image + text side by side" },
  social: { label: "Social", icon: "@", description: "Social media links" },
  footer: { label: "Footer", icon: "≡", description: "Small print & unsubscribe" },
  html: { label: "HTML", icon: "</>", description: "Raw custom HTML" },
};

export const BLOCK_TYPES = Object.keys(BLOCK_META) as BlockType[];

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function createBlock<K extends BlockType>(type: K): Block {
  return { id: newId(), type, props: structuredClone(BLOCK_DEFAULTS[type]) } as Block;
}

export function cloneBlock(block: Block): Block {
  return { ...structuredClone(block), id: newId() };
}

export function starterTemplate(): EmailTemplate {
  const blocks: Block[] = [
    createBlock("image"),
    createBlock("heading"),
    createBlock("text"),
    createBlock("button"),
    createBlock("divider"),
    createBlock("columns"),
    createBlock("social"),
    createBlock("footer"),
  ];
  const heading = blocks[1];
  if (heading.type === "heading") heading.props.text = "Welcome to our newsletter";
  return { settings: { ...DEFAULT_SETTINGS }, blocks };
}

/**
 * Accepts untrusted JSON (from localStorage or a file import) and returns a
 * well-formed template, filling in missing props with defaults and dropping
 * unknown block types. Returns null when the input is not a template at all.
 */
export function normalizeTemplate(input: unknown): EmailTemplate | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as { settings?: unknown; blocks?: unknown };
  if (!Array.isArray(raw.blocks)) return null;

  const settings = { ...DEFAULT_SETTINGS };
  if (raw.settings && typeof raw.settings === "object") {
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof EmailSettings)[]) {
      const value = (raw.settings as Record<string, unknown>)[key];
      if (typeof value === typeof DEFAULT_SETTINGS[key]) {
        (settings as Record<string, unknown>)[key] = value;
      }
    }
  }

  const blocks: Block[] = [];
  const seenIds = new Set<string>();
  for (const item of raw.blocks) {
    if (!item || typeof item !== "object") continue;
    const { type, props, id } = item as { type?: unknown; props?: unknown; id?: unknown };
    if (typeof type !== "string" || !(type in BLOCK_DEFAULTS)) continue;
    const defaults = BLOCK_DEFAULTS[type as BlockType] as unknown as Record<string, unknown>;
    const merged: Record<string, unknown> = { ...defaults };
    if (props && typeof props === "object") {
      for (const key of Object.keys(defaults)) {
        const value = (props as Record<string, unknown>)[key];
        if (typeof value === typeof defaults[key]) merged[key] = value;
      }
    }
    const blockId = typeof id === "string" && id && !seenIds.has(id) ? id : newId();
    seenIds.add(blockId);
    blocks.push({ id: blockId, type, props: merged } as unknown as Block);
  }

  return { settings, blocks };
}

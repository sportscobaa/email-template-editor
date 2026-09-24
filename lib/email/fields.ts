import type { BlockType, EmailSettings } from "./types";

interface BaseField {
  key: string;
  label: string;
  hint?: string;
}

export type FieldDef = BaseField &
  (
    | { type: "text" | "url"; placeholder?: string }
    | { type: "textarea"; rows?: number; monospace?: boolean }
    | { type: "number"; min: number; max: number; step?: number }
    | { type: "range"; min: number; max: number; unit?: string }
    | { type: "color"; allowEmpty?: boolean; emptyLabel?: string }
    | { type: "select"; options: [string, string][] }
    | { type: "checkbox" }
    | { type: "align" }
  );

export interface FieldGroup {
  title: string;
  fields: FieldDef[];
}

const FORMAT_HINT = "**bold**, *italic*, [link text](https://…), Enter = new line";

const ALIGN: FieldDef = { key: "align", label: "Alignment", type: "align" };

const SPACING: FieldGroup = {
  title: "Spacing & background",
  fields: [
    { key: "paddingY", label: "Vertical padding", type: "range", min: 0, max: 80, unit: "px" },
    { key: "paddingX", label: "Horizontal padding", type: "range", min: 0, max: 80, unit: "px" },
    { key: "backgroundColor", label: "Section background", type: "color", allowEmpty: true, emptyLabel: "None" },
  ],
};

const TEXT_COLOR: FieldDef = {
  key: "color",
  label: "Text color",
  type: "color",
  allowEmpty: true,
  emptyLabel: "Default",
};

export const BLOCK_FIELDS: Record<BlockType, FieldGroup[]> = {
  heading: [
    {
      title: "Content",
      fields: [
        { key: "text", label: "Text", type: "textarea", rows: 2, hint: FORMAT_HINT },
        { key: "level", label: "Level", type: "select", options: [["h1", "H1"], ["h2", "H2"], ["h3", "H3"]] },
      ],
    },
    {
      title: "Style",
      fields: [{ key: "fontSize", label: "Font size", type: "range", min: 12, max: 64, unit: "px" }, TEXT_COLOR, ALIGN],
    },
    SPACING,
  ],
  text: [
    { title: "Content", fields: [{ key: "text", label: "Text", type: "textarea", rows: 7, hint: FORMAT_HINT }] },
    {
      title: "Style",
      fields: [
        { key: "fontSize", label: "Font size", type: "range", min: 10, max: 32, unit: "px" },
        { key: "lineHeight", label: "Line height", type: "number", min: 1, max: 3, step: 0.1 },
        TEXT_COLOR,
        ALIGN,
      ],
    },
    SPACING,
  ],
  image: [
    {
      title: "Content",
      fields: [
        { key: "src", label: "Image URL", type: "url", placeholder: "https://…/image.png", hint: "Use a publicly hosted image URL." },
        { key: "alt", label: "Alt text", type: "text" },
        { key: "link", label: "Link (optional)", type: "url", placeholder: "https://" },
      ],
    },
    { title: "Style", fields: [{ key: "width", label: "Width", type: "range", min: 10, max: 100, unit: "%" }, ALIGN] },
    SPACING,
  ],
  button: [
    {
      title: "Content",
      fields: [
        { key: "text", label: "Label", type: "text" },
        { key: "url", label: "Link", type: "url", placeholder: "https://" },
      ],
    },
    {
      title: "Style",
      fields: [
        { key: "buttonColor", label: "Button color", type: "color" },
        { key: "textColor", label: "Text color", type: "color" },
        { key: "fontSize", label: "Font size", type: "range", min: 10, max: 28, unit: "px" },
        { key: "borderRadius", label: "Corner radius", type: "range", min: 0, max: 40, unit: "px" },
        { key: "fullWidth", label: "Full width", type: "checkbox" },
        ALIGN,
      ],
    },
    SPACING,
  ],
  divider: [
    {
      title: "Style",
      fields: [
        { key: "color", label: "Line color", type: "color" },
        { key: "thickness", label: "Thickness", type: "range", min: 1, max: 10, unit: "px" },
      ],
    },
    SPACING,
  ],
  spacer: [
    {
      title: "Style",
      fields: [
        { key: "height", label: "Height", type: "range", min: 4, max: 160, unit: "px" },
        { key: "backgroundColor", label: "Background", type: "color", allowEmpty: true, emptyLabel: "None" },
      ],
    },
  ],
  columns: [
    {
      title: "Left column",
      fields: [
        { key: "leftImage", label: "Image URL", type: "url", placeholder: "Leave empty for no image" },
        { key: "leftText", label: "Text", type: "textarea", rows: 4, hint: FORMAT_HINT },
      ],
    },
    {
      title: "Right column",
      fields: [
        { key: "rightImage", label: "Image URL", type: "url", placeholder: "Leave empty for no image" },
        { key: "rightText", label: "Text", type: "textarea", rows: 4, hint: FORMAT_HINT },
      ],
    },
    {
      title: "Style",
      fields: [
        { key: "gap", label: "Column gap", type: "range", min: 0, max: 60, unit: "px" },
        { key: "fontSize", label: "Font size", type: "range", min: 10, max: 24, unit: "px" },
        TEXT_COLOR,
      ],
    },
    SPACING,
  ],
  social: [
    {
      title: "Links",
      fields: [
        { key: "facebook", label: "Facebook", type: "url", placeholder: "Leave empty to hide" },
        { key: "x", label: "X / Twitter", type: "url", placeholder: "Leave empty to hide" },
        { key: "instagram", label: "Instagram", type: "url", placeholder: "Leave empty to hide" },
        { key: "linkedin", label: "LinkedIn", type: "url", placeholder: "Leave empty to hide" },
        { key: "youtube", label: "YouTube", type: "url", placeholder: "Leave empty to hide" },
        { key: "website", label: "Website", type: "url", placeholder: "Leave empty to hide" },
      ],
    },
    {
      title: "Style",
      fields: [
        { key: "pillColor", label: "Pill color", type: "color" },
        { key: "pillTextColor", label: "Pill text color", type: "color" },
        ALIGN,
      ],
    },
    SPACING,
  ],
  footer: [
    { title: "Content", fields: [{ key: "text", label: "Text", type: "textarea", rows: 4, hint: FORMAT_HINT }] },
    {
      title: "Style",
      fields: [
        { key: "fontSize", label: "Font size", type: "range", min: 10, max: 18, unit: "px" },
        { key: "color", label: "Text color", type: "color" },
        ALIGN,
      ],
    },
    SPACING,
  ],
  html: [
    {
      title: "Content",
      fields: [
        {
          key: "html",
          label: "HTML",
          type: "textarea",
          rows: 10,
          monospace: true,
          hint: "Inserted as-is into the email. Use inline styles.",
        },
      ],
    },
    SPACING,
  ],
};

export const FONT_OPTIONS: [string, string][] = [
  ["Arial, Helvetica, sans-serif", "Arial"],
  ["'Helvetica Neue', Helvetica, Arial, sans-serif", "Helvetica"],
  ["Verdana, Geneva, sans-serif", "Verdana"],
  ["Tahoma, Geneva, sans-serif", "Tahoma"],
  ["'Trebuchet MS', Helvetica, sans-serif", "Trebuchet MS"],
  ["Georgia, 'Times New Roman', serif", "Georgia"],
  ["'Times New Roman', Times, serif", "Times New Roman"],
  ["'Courier New', Courier, monospace", "Courier New"],
];

export const SETTINGS_FIELDS: (FieldGroup & { fields: (FieldDef & { key: keyof EmailSettings })[] })[] = [
  {
    title: "General",
    fields: [
      { key: "title", label: "Email title", type: "text", hint: "Used as the HTML <title>." },
      { key: "preheader", label: "Preheader text", type: "textarea", rows: 2, hint: "Preview text shown next to the subject in the inbox." },
    ],
  },
  {
    title: "Layout",
    fields: [
      { key: "contentWidth", label: "Content width", type: "range", min: 480, max: 800, unit: "px" },
      { key: "backgroundColor", label: "Page background", type: "color" },
      { key: "contentBackground", label: "Content background", type: "color" },
    ],
  },
  {
    title: "Typography",
    fields: [
      { key: "fontFamily", label: "Font", type: "select", options: FONT_OPTIONS },
      { key: "textColor", label: "Text color", type: "color" },
      { key: "linkColor", label: "Link color", type: "color" },
    ],
  },
];

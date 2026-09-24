import { DEFAULT_SETTINGS } from "./blocks";
import type { Align, Block, BlockPropsMap, EmailSettings, EmailTemplate, SectionProps } from "./types";

/*
 * Turns a template into email-client friendly HTML: table based layout,
 * inline styles, Outlook (MSO) conditionals and a mobile media query.
 * The same renderBlockRow() output is shown in the editor canvas, so what you
 * see while editing is what gets exported.
 */

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Allows http(s), mailto, tel, relative URLs, anchors and merge tags; blocks script schemes. */
export function safeUrl(value: unknown): string {
  const url = String(value ?? "").trim();
  if (!url) return "";
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  if (/^data:image\/(png|jpe?g|gif|webp);/i.test(url)) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return "#";
  return url;
}

export function safeColor(value: unknown, fallback: string): string {
  const color = String(value ?? "").trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) return color;
  if (/^(rgb|rgba|hsl|hsla)\([\d\s.,%]+\)$/i.test(color)) return color;
  if (/^[a-z]{3,20}$/i.test(color)) return color;
  return fallback;
}

function num(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function align(value: unknown): Align {
  return value === "left" || value === "right" ? value : "center";
}

function fontStack(settings: EmailSettings): string {
  // Double quotes would end the style attribute; font names only need single quotes.
  return escapeHtml(settings.fontFamily.replace(/"/g, "'"));
}

/**
 * Lightweight formatting for text fields. Everything is HTML-escaped first,
 * then **bold**, *italic*, [label](url) and line breaks are converted.
 */
export function formatText(text: string, linkColor: string): string {
  let out = escapeHtml(text);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
    const href = safeUrl(url) || "#";
    return `<a href="${href}" target="_blank" style="color:${linkColor};text-decoration:underline;">${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  out = out.replace(/\r?\n/g, "<br>");
  return out;
}

function sectionRow(props: SectionProps, inner: string, textAlign: Align = "left"): string {
  const py = num(props.paddingY, 12, 0, 200);
  const px = num(props.paddingX, 24, 0, 200);
  const bg = props.backgroundColor ? safeColor(props.backgroundColor, "") : "";
  const bgAttr = bg ? ` bgcolor="${bg}"` : "";
  const bgStyle = bg ? `background-color:${bg};` : "";
  return `<tr><td align="${textAlign}"${bgAttr} style="${bgStyle}padding:${py}px ${px}px;text-align:${textAlign};">${inner}</td></tr>`;
}

function innerWidth(props: SectionProps, settings: EmailSettings): number {
  return Math.max(50, settings.contentWidth - 2 * num(props.paddingX, 24, 0, 200));
}

type Renderer<K extends keyof BlockPropsMap> = (props: BlockPropsMap[K], settings: EmailSettings) => string;

const SOCIAL_NETWORKS = [
  ["facebook", "Facebook"],
  ["x", "X"],
  ["instagram", "Instagram"],
  ["linkedin", "LinkedIn"],
  ["youtube", "YouTube"],
  ["website", "Website"],
] as const;

const renderers: { [K in keyof BlockPropsMap]: Renderer<K> } = {
  heading(p, s) {
    const tag = p.level === "h1" || p.level === "h2" || p.level === "h3" ? p.level : "h2";
    const a = align(p.align);
    const color = safeColor(p.color, s.textColor);
    const size = num(p.fontSize, 28, 8, 96);
    return sectionRow(
      p,
      `<${tag} style="margin:0;font-family:${fontStack(s)};font-size:${size}px;line-height:1.25;font-weight:bold;color:${color};">${formatText(p.text, s.linkColor)}</${tag}>`,
      a,
    );
  },

  text(p, s) {
    const a = align(p.align);
    const color = safeColor(p.color, s.textColor);
    const size = num(p.fontSize, 16, 8, 72);
    const lh = num(p.lineHeight, 1.6, 1, 3);
    return sectionRow(
      p,
      `<div style="margin:0;font-family:${fontStack(s)};font-size:${size}px;line-height:${lh};color:${color};">${formatText(p.text, s.linkColor)}</div>`,
      a,
    );
  },

  image(p, s) {
    const a = align(p.align);
    const width = Math.round((innerWidth(p, s) * num(p.width, 100, 10, 100)) / 100);
    const src = safeUrl(p.src);
    if (!src) return sectionRow(p, "", a);
    const margin = a === "center" ? "margin:0 auto;" : a === "right" ? "margin:0 0 0 auto;" : "";
    let img = `<img src="${escapeHtml(src)}" alt="${escapeHtml(p.alt)}" width="${width}" style="display:block;width:100%;max-width:${width}px;height:auto;border:0;outline:none;text-decoration:none;${margin}">`;
    const link = safeUrl(p.link);
    if (link) img = `<a href="${escapeHtml(link)}" target="_blank" style="text-decoration:none;">${img}</a>`;
    return sectionRow(p, img, a);
  },

  button(p, s) {
    const a = align(p.align);
    const bg = safeColor(p.buttonColor, "#2563eb");
    const color = safeColor(p.textColor, "#ffffff");
    const radius = num(p.borderRadius, 6, 0, 100);
    const size = num(p.fontSize, 16, 8, 48);
    const href = escapeHtml(safeUrl(p.url) || "#");
    const margin = p.fullWidth ? "" : a === "center" ? "margin:0 auto;" : a === "right" ? "margin:0 0 0 auto;" : "";
    const widthAttr = p.fullWidth ? ' width="100%"' : "";
    const display = p.fullWidth ? "block" : "inline-block";
    const button =
      `<table role="presentation" border="0" cellpadding="0" cellspacing="0"${widthAttr} style="border-collapse:separate;${margin}">` +
      `<tr><td align="center" bgcolor="${bg}" style="border-radius:${radius}px;background-color:${bg};">` +
      `<a href="${href}" target="_blank" style="display:${display};padding:12px 28px;font-family:${fontStack(s)};font-size:${size}px;font-weight:bold;line-height:1.2;color:${color};text-decoration:none;border-radius:${radius}px;">${escapeHtml(p.text)}</a>` +
      `</td></tr></table>`;
    return sectionRow(p, button, a);
  },

  divider(p) {
    const color = safeColor(p.color, "#e5e7eb");
    const thickness = num(p.thickness, 1, 1, 20);
    return sectionRow(
      p,
      `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td style="border-top:${thickness}px solid ${color};font-size:1px;line-height:1px;">&nbsp;</td></tr></table>`,
    );
  },

  spacer(p) {
    const h = num(p.height, 32, 1, 400);
    const bg = p.backgroundColor ? safeColor(p.backgroundColor, "") : "";
    const bgAttr = bg ? ` bgcolor="${bg}"` : "";
    const bgStyle = bg ? `background-color:${bg};` : "";
    return `<tr><td height="${h}"${bgAttr} style="${bgStyle}height:${h}px;font-size:${h}px;line-height:${h}px;">&nbsp;</td></tr>`;
  },

  columns(p, s) {
    const gap = num(p.gap, 16, 0, 80);
    const half = Math.floor(gap / 2);
    const colWidth = Math.floor((innerWidth(p, s) - gap) / 2);
    const color = safeColor(p.color, s.textColor);
    const size = num(p.fontSize, 15, 8, 48);
    const column = (image: string, text: string, side: "left" | "right") => {
      const src = safeUrl(image);
      const pad = side === "left" ? `padding-right:${half}px;` : `padding-left:${half}px;`;
      const img = src
        ? `<img src="${escapeHtml(src)}" alt="" width="${colWidth}" style="display:block;width:100%;max-width:${colWidth}px;height:auto;border:0;margin:0 0 12px 0;">`
        : "";
      return (
        `<td class="etb-col" width="50%" valign="top" style="width:50%;vertical-align:top;${pad}">` +
        `${img}<div style="font-family:${fontStack(s)};font-size:${size}px;line-height:1.5;color:${color};">${formatText(text, s.linkColor)}</div></td>`
      );
    };
    return sectionRow(
      p,
      `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>` +
        column(p.leftImage, p.leftText, "left") +
        column(p.rightImage, p.rightText, "right") +
        `</tr></table>`,
    );
  },

  social(p, s) {
    const a = align(p.align);
    const bg = safeColor(p.pillColor, "#f3f4f6");
    const color = safeColor(p.pillTextColor, "#111827");
    const links = SOCIAL_NETWORKS.filter(([key]) => safeUrl(p[key]))
      .map(
        ([key, label]) =>
          `<a href="${escapeHtml(safeUrl(p[key]))}" target="_blank" style="display:inline-block;margin:4px;padding:8px 14px;border-radius:999px;background-color:${bg};color:${color};font-family:${fontStack(s)};font-size:13px;font-weight:bold;text-decoration:none;">${label}</a>`,
      )
      .join("");
    return sectionRow(p, links, a);
  },

  footer(p, s) {
    const a = align(p.align);
    const color = safeColor(p.color, "#9ca3af");
    const size = num(p.fontSize, 12, 8, 32);
    return sectionRow(
      p,
      `<div style="font-family:${fontStack(s)};font-size:${size}px;line-height:1.5;color:${color};">${formatText(p.text, color)}</div>`,
      a,
    );
  },

  html(p) {
    // Raw HTML is inserted as-is on purpose: this block exists for custom markup.
    return sectionRow(p, String(p.html ?? ""));
  },
};

export function resolveSettings(settings?: Partial<EmailSettings>): EmailSettings {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  return {
    ...s,
    contentWidth: num(s.contentWidth, 600, 320, 1000),
    backgroundColor: safeColor(s.backgroundColor, DEFAULT_SETTINGS.backgroundColor),
    contentBackground: safeColor(s.contentBackground, DEFAULT_SETTINGS.contentBackground),
    textColor: safeColor(s.textColor, DEFAULT_SETTINGS.textColor),
    linkColor: safeColor(s.linkColor, DEFAULT_SETTINGS.linkColor),
  };
}

/** Renders one block as a `<tr>` for the main content table. */
export function renderBlockRow(block: Block, settings: EmailSettings): string {
  const render = renderers[block.type] as Renderer<typeof block.type> | undefined;
  return render ? render(block.props as never, settings) : "";
}

export function renderEmail(template: EmailTemplate): string {
  const s = resolveSettings(template.settings);
  const width = s.contentWidth;
  const rows = template.blocks.map((b) => renderBlockRow(b, s)).join("\n");
  const preheader = s.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${s.backgroundColor};opacity:0;">${escapeHtml(s.preheader)}</div>\n`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
<title>${escapeHtml(s.title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
  body { margin:0 !important; padding:0 !important; width:100% !important; }
  a { color:${s.linkColor}; }
  @media only screen and (max-width:${width + 20}px) {
    .etb-container { width:100% !important; max-width:100% !important; }
    .etb-col { display:block !important; width:100% !important; padding-left:0 !important; padding-right:0 !important; padding-bottom:16px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${s.backgroundColor};">
${preheader}<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${s.backgroundColor}" style="background-color:${s.backgroundColor};">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="${width}" align="center" border="0" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" class="etb-container" width="${width}" border="0" cellpadding="0" cellspacing="0" bgcolor="${s.contentBackground}" style="width:${width}px;max-width:${width}px;background-color:${s.contentBackground};">
${rows}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>
`;
}

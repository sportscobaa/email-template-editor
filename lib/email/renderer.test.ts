import { describe, expect, it } from "vitest";
import { createBlock, normalizeTemplate, starterTemplate, BLOCK_TYPES } from "./blocks";
import { formatText, renderEmail, safeUrl } from "./renderer";
import type { EmailTemplate } from "./types";

function withBlocks(...blocks: EmailTemplate["blocks"]): EmailTemplate {
  return { ...starterTemplate(), blocks };
}

describe("renderEmail", () => {
  it("produces a complete, table-based HTML document", () => {
    const html = renderEmail(starterTemplate());
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).toContain('class="etb-container" width="600"');
    expect(html).toContain("<!--[if mso]>");
    expect(html).toContain("Welcome to our newsletter");
    expect(html.trim().endsWith("</html>")).toBe(true);
  });

  it("renders every block type without throwing", () => {
    const template = withBlocks(...BLOCK_TYPES.map((t) => createBlock(t)));
    const html = renderEmail(template);
    expect((html.match(/<tr><td/g) ?? []).length).toBeGreaterThanOrEqual(BLOCK_TYPES.length);
  });

  it("escapes user text so it cannot inject markup", () => {
    const block = createBlock("heading");
    if (block.type !== "heading") throw new Error();
    block.props.text = '<img src=x onerror="alert(1)">';
    const html = renderEmail(withBlocks(block));
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  it("neutralises javascript: links on buttons", () => {
    const block = createBlock("button");
    if (block.type !== "button") throw new Error();
    block.props.url = "javascript:alert(1)";
    const html = renderEmail(withBlocks(block));
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="#"');
  });

  it("uses the configured content width", () => {
    const template = starterTemplate();
    template.settings.contentWidth = 700;
    const html = renderEmail(template);
    expect(html).toContain('width="700"');
    expect(html).toContain("max-width:720px");
  });

  it("includes a hidden preheader when set", () => {
    const template = starterTemplate();
    template.settings.preheader = "Inbox preview text";
    expect(renderEmail(template)).toContain("Inbox preview text</div>");
  });
});

describe("formatText", () => {
  it("converts bold, italic, links and newlines", () => {
    const out = formatText("**b** *i* [go](https://x.com)\nnext", "#123456");
    expect(out).toContain("<strong>b</strong>");
    expect(out).toContain("<em>i</em>");
    expect(out).toContain('<a href="https://x.com" target="_blank" style="color:#123456;');
    expect(out).toContain("<br>next");
  });
});

describe("safeUrl", () => {
  it("keeps normal links and merge tags, blocks script schemes", () => {
    expect(safeUrl("https://a.com")).toBe("https://a.com");
    expect(safeUrl("mailto:a@b.com")).toBe("mailto:a@b.com");
    expect(safeUrl("{{unsubscribe_url}}")).toBe("{{unsubscribe_url}}");
    expect(safeUrl(" JavaScript:alert(1)")).toBe("#");
    expect(safeUrl("data:text/html,hi")).toBe("#");
  });
});

describe("normalizeTemplate", () => {
  it("fills defaults, drops unknown blocks and fixes duplicate ids", () => {
    const t = normalizeTemplate({
      blocks: [
        { id: "a", type: "text", props: { text: "hi", fontSize: "big" } },
        { id: "a", type: "button" },
        { type: "nope" },
      ],
    });
    expect(t).not.toBeNull();
    expect(t!.blocks).toHaveLength(2);
    expect(t!.blocks[0].props).toMatchObject({ text: "hi", fontSize: 16 });
    expect(t!.blocks[1].id).not.toBe("a");
  });

  it("rejects non-templates", () => {
    expect(normalizeTemplate(null)).toBeNull();
    expect(normalizeTemplate({ foo: 1 })).toBeNull();
  });
});

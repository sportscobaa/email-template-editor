# Email Template Editor

Next.js diye banano drag-and-drop email template builder. Block gulo drag kore email banan, tarpor email-client-friendly **HTML output** copy/download korun.

A drag-and-drop email builder built with Next.js (App Router + TypeScript). Build an email from blocks and export production-ready HTML.

## Features

- **Drag & drop** blocks from the sidebar onto the email, and drag blocks to reorder (or click a block to add it; ↑/↓ buttons on touch devices)
- **Blocks:** Heading, Text, Image, Button, Divider, Spacer, 2 Columns, Social links, Footer, raw HTML
- **Properties panel** for every block (text, colors, alignment, sizes, padding, section background) plus global email settings (width, fonts, colors, preheader)
- Text formatting: `**bold**`, `*italic*`, `[link](https://…)`, new lines
- **HTML output:** table-based layout, inline styles, Outlook (MSO) conditionals, mobile media query (columns stack on phones), hidden preheader
- Preview in desktop / mobile width, **Copy HTML** or **Download .html**
- Undo / redo, autosave to the browser, save/import the template as JSON
- Keyboard: `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` or `Ctrl+Y` redo, `Ctrl/Cmd+D` duplicate, `Delete` remove, `Esc` deselect

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build && npm start   # production build
npm test                     # unit tests (Vitest)
npm run lint                 # TypeScript type check
```

## HTML via API

`POST /api/render` with a template JSON (the same file **Save JSON** downloads) returns the email HTML:

```bash
curl -X POST http://localhost:3000/api/render \
  -H 'Content-Type: application/json' \
  -d '{"blocks":[{"type":"heading","props":{"text":"Hello"}},{"type":"button","props":{"text":"Shop now","url":"https://example.com"}}]}'
```

## Project structure

```
app/
  page.tsx               editor page
  api/render/route.ts    template JSON -> HTML endpoint
components/editor/       editor UI (palette, canvas, properties, output modal)
lib/email/
  types.ts               template & block types
  blocks.ts              block defaults, starter template, JSON validation
  fields.ts              properties-panel field definitions
  renderer.ts            template -> email HTML
  editorState.ts         editor reducer (add/move/edit/undo/redo)
```

### Adding a new block type

1. Add its props interface to `lib/email/types.ts` and to `BlockPropsMap`
2. Add defaults and palette metadata in `lib/email/blocks.ts`
3. Add a renderer in `lib/email/renderer.ts`
4. Add its property fields in `lib/email/fields.ts`

Images must be hosted at a public URL — most email clients do not show embedded/base64 images.

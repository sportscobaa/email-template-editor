import { cloneBlock, createBlock } from "./blocks";
import type { Block, BlockType, EmailSettings, EmailTemplate } from "./types";

const HISTORY_LIMIT = 100;

export interface EditorState {
  template: EmailTemplate;
  selectedId: string | null;
  past: EmailTemplate[];
  future: EmailTemplate[];
  /** Consecutive edits with the same key are merged into one undo step (e.g. typing). */
  lastEditKey: string | null;
}

export type EditorAction =
  | { type: "add"; blockType: BlockType; index?: number }
  | { type: "move"; id: string; index: number }
  | { type: "moveBy"; id: string; delta: number }
  | { type: "updateBlock"; id: string; patch: Record<string, unknown>; editKey?: string }
  | { type: "updateSettings"; patch: Partial<EmailSettings>; editKey?: string }
  | { type: "duplicate"; id: string }
  | { type: "remove"; id: string }
  | { type: "load"; template: EmailTemplate }
  | { type: "select"; id: string | null }
  | { type: "undo" }
  | { type: "redo" };

export function initEditorState(template: EmailTemplate): EditorState {
  return { template, selectedId: null, past: [], future: [], lastEditKey: null };
}

function commit(state: EditorState, template: EmailTemplate, extra: Partial<EditorState> = {}, editKey?: string): EditorState {
  const merge = editKey !== undefined && editKey === state.lastEditKey;
  const past = merge ? state.past : [...state.past, state.template].slice(-HISTORY_LIMIT);
  return { ...state, ...extra, template, past, future: [], lastEditKey: editKey ?? null };
}

function withBlocks(template: EmailTemplate, blocks: Block[]): EmailTemplate {
  return { ...template, blocks };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  const { template } = state;
  const blocks = template.blocks;

  switch (action.type) {
    case "add": {
      const block = createBlock(action.blockType);
      const index = Math.max(0, Math.min(action.index ?? blocks.length, blocks.length));
      const next = [...blocks.slice(0, index), block, ...blocks.slice(index)];
      return commit(state, withBlocks(template, next), { selectedId: block.id });
    }

    case "move": {
      const from = blocks.findIndex((b) => b.id === action.id);
      if (from === -1) return state;
      // `index` is an insertion point in the list *before* removal.
      let to = Math.max(0, Math.min(action.index, blocks.length));
      if (from < to) to -= 1;
      if (from === to) return state;
      const next = [...blocks];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return commit(state, withBlocks(template, next), { selectedId: moved.id });
    }

    case "moveBy": {
      const from = blocks.findIndex((b) => b.id === action.id);
      const to = from + action.delta;
      if (from === -1 || to < 0 || to >= blocks.length) return state;
      const next = [...blocks];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return commit(state, withBlocks(template, next));
    }

    case "updateBlock": {
      let changed = false;
      const next = blocks.map((b) => {
        if (b.id !== action.id) return b;
        changed = true;
        return { ...b, props: { ...b.props, ...action.patch } } as Block;
      });
      if (!changed) return state;
      return commit(state, withBlocks(template, next), {}, action.editKey);
    }

    case "updateSettings":
      return commit(state, { ...template, settings: { ...template.settings, ...action.patch } }, {}, action.editKey);

    case "duplicate": {
      const index = blocks.findIndex((b) => b.id === action.id);
      if (index === -1) return state;
      const copy = cloneBlock(blocks[index]);
      const next = [...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)];
      return commit(state, withBlocks(template, next), { selectedId: copy.id });
    }

    case "remove": {
      if (!blocks.some((b) => b.id === action.id)) return state;
      const next = blocks.filter((b) => b.id !== action.id);
      const selectedId = state.selectedId === action.id ? null : state.selectedId;
      return commit(state, withBlocks(template, next), { selectedId });
    }

    case "load":
      return commit(state, action.template, { selectedId: null });

    case "select":
      return state.selectedId === action.id ? state : { ...state, selectedId: action.id, lastEditKey: null };

    case "undo": {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return {
        ...state,
        template: previous,
        past: state.past.slice(0, -1),
        future: [template, ...state.future],
        selectedId: previous.blocks.some((b) => b.id === state.selectedId) ? state.selectedId : null,
        lastEditKey: null,
      };
    }

    case "redo": {
      if (!state.future.length) return state;
      const [next, ...rest] = state.future;
      return {
        ...state,
        template: next,
        past: [...state.past, template],
        future: rest,
        selectedId: next.blocks.some((b) => b.id === state.selectedId) ? state.selectedId : null,
        lastEditKey: null,
      };
    }
  }
}

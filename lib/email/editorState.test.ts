import { describe, expect, it } from "vitest";
import { createBlock } from "./blocks";
import { editorReducer, initEditorState, type EditorState } from "./editorState";
import { DEFAULT_SETTINGS } from "./blocks";

function stateWith(n: number): EditorState {
  const blocks = Array.from({ length: n }, () => createBlock("text"));
  return initEditorState({ settings: { ...DEFAULT_SETTINGS }, blocks });
}

const ids = (s: EditorState) => s.template.blocks.map((b) => b.id);

describe("editorReducer", () => {
  it("adds a block at the drop index and selects it", () => {
    const s0 = stateWith(2);
    const s1 = editorReducer(s0, { type: "add", blockType: "button", index: 1 });
    expect(s1.template.blocks.map((b) => b.type)).toEqual(["text", "button", "text"]);
    expect(s1.selectedId).toBe(s1.template.blocks[1].id);
  });

  it("moves blocks using insertion indexes", () => {
    const s0 = stateWith(3);
    const [a, b, c] = ids(s0);
    expect(ids(editorReducer(s0, { type: "move", id: a, index: 3 }))).toEqual([b, c, a]);
    expect(ids(editorReducer(s0, { type: "move", id: c, index: 0 }))).toEqual([c, a, b]);
    expect(editorReducer(s0, { type: "move", id: a, index: 1 })).toBe(s0);
  });

  it("undoes and redoes, merging consecutive edits of the same field", () => {
    const s0 = stateWith(1);
    const id = ids(s0)[0];
    let s = editorReducer(s0, { type: "updateBlock", id, patch: { text: "a" }, editKey: `${id}:text` });
    s = editorReducer(s, { type: "updateBlock", id, patch: { text: "ab" }, editKey: `${id}:text` });
    expect(s.past).toHaveLength(1);
    s = editorReducer(s, { type: "undo" });
    expect(s.template).toBe(s0.template);
    s = editorReducer(s, { type: "redo" });
    expect(s.template.blocks[0].props).toMatchObject({ text: "ab" });
  });

  it("duplicates and removes blocks", () => {
    const s0 = stateWith(1);
    const id = ids(s0)[0];
    const s1 = editorReducer(s0, { type: "duplicate", id });
    expect(s1.template.blocks).toHaveLength(2);
    expect(new Set(ids(s1)).size).toBe(2);
    const s2 = editorReducer({ ...s1, selectedId: id }, { type: "remove", id });
    expect(s2.template.blocks).toHaveLength(1);
    expect(s2.selectedId).toBeNull();
  });
});

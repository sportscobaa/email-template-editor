"use client";

import { BLOCK_META } from "@/lib/email/blocks";
import type { EditorAction } from "@/lib/email/editorState";
import { BLOCK_FIELDS, SETTINGS_FIELDS } from "@/lib/email/fields";
import type { Block, EmailSettings } from "@/lib/email/types";
import Field from "./Field";

interface PropertiesPanelProps {
  block: Block | null;
  settings: EmailSettings;
  dispatch: React.Dispatch<EditorAction>;
}

export default function PropertiesPanel({ block, settings, dispatch }: PropertiesPanelProps) {
  if (!block) {
    return (
      <div className="properties">
        <div className="properties-header">
          <h2>Email settings</h2>
          <p className="panel-hint">Select a block in the email to edit it.</p>
        </div>
        {SETTINGS_FIELDS.map((group) => (
          <fieldset key={group.title} className="field-group">
            <legend>{group.title}</legend>
            {group.fields.map((def) => (
              <Field
                key={def.key}
                def={def}
                value={settings[def.key as keyof EmailSettings]}
                onChange={(value) =>
                  dispatch({ type: "updateSettings", patch: { [def.key]: value }, editKey: `settings:${def.key}` })
                }
              />
            ))}
          </fieldset>
        ))}
      </div>
    );
  }

  const props = block.props as unknown as Record<string, unknown>;
  return (
    <div className="properties">
      <div className="properties-header">
        <button type="button" className="btn btn-ghost btn-sm back" onClick={() => dispatch({ type: "select", id: null })}>
          ← Email settings
        </button>
        <h2>{BLOCK_META[block.type].label}</h2>
        <div className="properties-actions">
          <button type="button" className="btn btn-sm" onClick={() => dispatch({ type: "duplicate", id: block.id })}>
            Duplicate
          </button>
          <button type="button" className="btn btn-sm btn-danger" onClick={() => dispatch({ type: "remove", id: block.id })}>
            Delete
          </button>
        </div>
      </div>
      {BLOCK_FIELDS[block.type].map((group) => (
        <fieldset key={group.title} className="field-group">
          <legend>{group.title}</legend>
          {group.fields.map((def) => (
            <Field
              key={def.key}
              def={def}
              value={props[def.key]}
              onChange={(value) =>
                dispatch({
                  type: "updateBlock",
                  id: block.id,
                  patch: { [def.key]: value },
                  editKey: `${block.id}:${def.key}`,
                })
              }
            />
          ))}
        </fieldset>
      ))}
    </div>
  );
}

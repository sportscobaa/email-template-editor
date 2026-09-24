"use client";

import { useId } from "react";
import type { FieldDef } from "@/lib/email/fields";

interface FieldProps {
  def: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}

function toHex6(value: string): string {
  const v = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  if (/^#[0-9a-f]{3}$/i.test(v)) return "#" + [...v.slice(1)].map((c) => c + c).join("");
  return "#000000";
}

export default function Field({ def, value, onChange }: FieldProps) {
  const id = useId();
  const label = (
    <label className="field-label" htmlFor={id}>
      {def.label}
    </label>
  );
  const hint = def.hint ? <p className="field-hint">{def.hint}</p> : null;

  switch (def.type) {
    case "text":
    case "url":
      return (
        <div className="field">
          {label}
          <input
            id={id}
            className="input"
            type="text"
            inputMode={def.type === "url" ? "url" : undefined}
            spellCheck={def.type === "text"}
            placeholder={def.placeholder}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
          {hint}
        </div>
      );

    case "textarea":
      return (
        <div className="field">
          {label}
          <textarea
            id={id}
            className={def.monospace ? "input textarea mono" : "input textarea"}
            rows={def.rows ?? 4}
            spellCheck={!def.monospace}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
          {hint}
        </div>
      );

    case "number":
      return (
        <div className="field">
          {label}
          <input
            id={id}
            className="input"
            type="number"
            min={def.min}
            max={def.max}
            step={def.step ?? 1}
            value={Number(value ?? 0)}
            onChange={(e) => {
              const n = e.target.valueAsNumber;
              if (Number.isFinite(n)) onChange(Math.min(def.max, Math.max(def.min, n)));
            }}
          />
          {hint}
        </div>
      );

    case "range":
      return (
        <div className="field">
          <div className="field-row">
            {label}
            <span className="field-value">
              {Number(value ?? 0)}
              {def.unit}
            </span>
          </div>
          <input
            id={id}
            className="range"
            type="range"
            min={def.min}
            max={def.max}
            value={Number(value ?? 0)}
            onChange={(e) => onChange(e.target.valueAsNumber)}
          />
          {hint}
        </div>
      );

    case "color": {
      const text = String(value ?? "");
      return (
        <div className="field">
          {label}
          <div className="color-field">
            <input
              aria-label={`${def.label} picker`}
              className={text ? "color-swatch" : "color-swatch empty"}
              type="color"
              value={toHex6(text || "#ffffff")}
              onChange={(e) => onChange(e.target.value)}
            />
            <input
              id={id}
              className="input"
              type="text"
              spellCheck={false}
              placeholder={def.allowEmpty ? def.emptyLabel ?? "None" : "#000000"}
              value={text}
              onChange={(e) => onChange(e.target.value)}
            />
            {def.allowEmpty && text ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange("")} title="Clear">
                ✕
              </button>
            ) : null}
          </div>
          {hint}
        </div>
      );
    }

    case "select":
      return (
        <div className="field">
          {label}
          <select id={id} className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            {def.options.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          {hint}
        </div>
      );

    case "checkbox":
      return (
        <div className="field">
          <label className="checkbox" htmlFor={id}>
            <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
            <span>{def.label}</span>
          </label>
          {hint}
        </div>
      );

    case "align":
      return (
        <div className="field">
          <span className="field-label">{def.label}</span>
          <div className="segmented" role="radiogroup" aria-label={def.label}>
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={value === a}
                className={value === a ? "active" : ""}
                onClick={() => onChange(a)}
              >
                {a[0].toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
          {hint}
        </div>
      );
  }
}

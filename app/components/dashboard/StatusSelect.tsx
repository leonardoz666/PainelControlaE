"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { Status } from "./types";

const STATUS_OPTIONS: Array<{ value: Status; label: string }> = [
  { value: "TESTE", label: "Em teste" },
  { value: "ATIVO", label: "Ativo" },
  { value: "INADIMPLENTE", label: "Inadimplente" },
  { value: "SUSPENSO", label: "Suspenso" },
  { value: "CANCELADO", label: "Cancelado" },
];

export function StatusSelect({
  name,
  value,
  canActivate,
  onChange,
}: {
  name: string;
  value: Status;
  canActivate: boolean;
  onChange: (status: Status) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = STATUS_OPTIONS.find((option) => option.value === value) ?? STATUS_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`status-menu ${open ? "status-menu--open" : ""}`}>
      <button
        type="button"
        className="status-menu-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Situação de ${name}: ${selected.label}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={`status-dot status-dot--${value.toLocaleLowerCase()}`} aria-hidden="true" />
        <span>{selected.label}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open ? (
        <div className="status-menu-options" role="listbox" aria-label={`Alterar situação de ${name}`}>
          {STATUS_OPTIONS.map((option) => {
            const disabled = option.value === "ATIVO" && !canActivate;
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                disabled={disabled}
                className="status-menu-option"
                onClick={() => {
                  setOpen(false);
                  if (!active) onChange(option.value);
                }}
              >
                <span className={`status-dot status-dot--${option.value.toLocaleLowerCase()}`} aria-hidden="true" />
                <span>{option.label}</span>
                {active ? <Check size={14} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

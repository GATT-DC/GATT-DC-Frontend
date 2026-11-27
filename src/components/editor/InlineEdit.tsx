"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import BlogImage from "@/components/blog/BlogImage";
import ScriptText from "@/components/blog/ScriptText";

// Piezas para editar "en su lugar" (sobre el mismo diseño que se publica):
// las usan los editores de blogs y de eventos.

// Botones redondos sobre las imagenes y tarjetas.
export const ROUND_BUTTON =
  "flex h-8 w-8 items-center justify-center rounded-full bg-[#141414]/85 font-ui text-[13px] text-white shadow transition-colors hover:bg-naranja disabled:opacity-30 disabled:hover:bg-[#141414]/85";
export const SMALL_ROUND = ROUND_BUTTON.replace("h-8 w-8", "h-6 w-6").replace("text-[13px]", "text-[11px]");

// Quita la barra inicial que se cuela al copiar rutas del bucket.
export const cleanPath = (value: string) => value.trim().replace(/^\/+/, "");

// Area de texto que crece con su contenido, para que se vea como el texto
// publicado. singleLine: Enter no agrega saltos de linea.
export function AutoTextarea({
  value,
  onChange,
  className,
  placeholder,
  label,
  singleLine = false,
  autoFocus = false,
  onBlur,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  className: string;
  placeholder: string;
  label: string;
  singleLine?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
  maxLength: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      aria-label={label}
      placeholder={placeholder}
      autoFocus={autoFocus}
      maxLength={maxLength}
      onBlur={onBlur}
      onKeyDown={singleLine ? (e) => e.key === "Enter" && e.preventDefault() : undefined}
      onChange={(e) => onChange(singleLine ? e.target.value.replace(/\n/g, " ") : e.target.value)}
      className={`block w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-current placeholder:opacity-35 ${className}`}
    />
  );
}

// Marco punteado que indica "esto se puede editar".
const frame = (onYellow: boolean) =>
  `rounded-md outline-dashed outline-1 outline-offset-4 transition-[outline-color] ${
    onYellow ? "outline-[#141414]/30" : "outline-texto/25"
  } hover:outline-naranja focus-within:outline-2 focus-within:outline-naranja`;

// Texto editable en su lugar. Con script, fuera de edicion se ve como queda
// publicado (las *palabras* en cursiva) y al hacer clic se edita el texto.
export function EditableText({
  value,
  onChange,
  placeholder,
  label,
  className,
  script = false,
  multiline = false,
  onYellow = false,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className: string;
  script?: boolean;
  multiline?: boolean;
  onYellow?: boolean;
  maxLength: number;
}) {
  const [editing, setEditing] = useState(false);
  if (script && !editing) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Edit ${label}`}
        onClick={() => setEditing(true)}
        onFocus={() => setEditing(true)}
        className={`${frame(onYellow)} cursor-text ${className}`}
      >
        {value.trim() ? <ScriptText text={value} /> : <span className="opacity-35">{placeholder}</span>}
      </div>
    );
  }
  return (
    <div className={frame(onYellow)}>
      <AutoTextarea
        value={value}
        onChange={onChange}
        label={label}
        placeholder={placeholder}
        className={className}
        singleLine={!multiline}
        autoFocus={script}
        onBlur={script ? () => setEditing(false) : undefined}
        maxLength={maxLength}
      />
    </div>
  );
}

export function ImageIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5-5-9 9" />
    </svg>
  );
}

// Imagen editable: el boton de la esquina abre el campo con la ruta en S3.
export function ImageSlot({
  path,
  onChange,
  label,
  className,
  onLight = false,
  startOpen = false,
  compact = false,
  tools,
  children,
}: {
  path: string;
  onChange: (path: string) => void;
  label: string;
  className: string;
  onLight?: boolean;
  startOpen?: boolean;
  // Fotos chicas (collage): botones y campo mas pequenos.
  compact?: boolean;
  tools?: ReactNode;
  // Lo que va encima de la foto (p. ej. nombre del panelista).
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(startOpen);
  return (
    <div className={`relative ${className}`}>
      <BlogImage path={cleanPath(path)} alt={label} className="h-full w-full" onLight={onLight} />
      {children}
      <div className={`absolute flex items-start justify-between ${compact ? "inset-x-1 top-1 gap-1" : "inset-x-2 top-2 gap-1.5"}`}>
        <div className={`flex ${compact ? "gap-1" : "gap-1.5"}`}>{tools}</div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={compact ? SMALL_ROUND : ROUND_BUTTON}
          aria-label={`Change ${label}`}
          aria-expanded={open}
        >
          <ImageIcon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>
      </div>
      {open && (
        <div className={`absolute rounded-[10px] bg-[#141414]/90 text-white shadow-lg ${compact ? "inset-x-1 bottom-1 p-2" : "inset-x-2 bottom-2 p-2.5"}`}>
          <label className="block font-ui text-[11px] uppercase tracking-wide text-white/70">
            {compact ? "Image path" : `${label}: path in media storage`}
            <input
              autoFocus
              value={path}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && setOpen(false)}
              placeholder="blogs/event-name/photo.jpg"
              maxLength={500}
              className="mt-1 block w-full border-b border-white/40 bg-transparent pb-1 font-ui text-[13px] normal-case tracking-normal text-white outline-none placeholder:text-white/40 focus:border-naranja"
            />
          </label>
          <button type="button" onClick={() => setOpen(false)} className="mt-2 font-ui text-[12px] text-white/80 hover:text-white">
            Done
          </button>
        </div>
      )}
    </div>
  );
}

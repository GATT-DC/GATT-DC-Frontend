"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export type ConfirmOptions = {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  // danger: accion destructiva (boton rojo).
  tone?: "danger" | "default";
};

type Props = ConfirmOptions & { onClose: (confirmed: boolean) => void };

// Ventana de confirmacion con el diseño del sitio (en vez de la del
// navegador). Esc o un clic afuera cancelan; el foco queda dentro mientras
// esta abierta y vuelve a donde estaba al cerrarla.
function ConfirmDialog({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "default", onClose }: Props) {
  const titleId = useId();
  const messageId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    // En las acciones destructivas el foco empieza en "Cancel", para que un
    // Enter apurado no borre nada.
    (tone === "danger" ? cancelRef : confirmRef).current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [tone]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose(false);
    }
    // Tab y Shift+Tab se quedan entre los dos botones.
    if (e.key === "Tab") {
      const buttons = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[];
      const index = buttons.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      buttons[(index + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm [animation:confirm-fade_150ms_ease-out]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose(false);
      }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        onKeyDown={onKeyDown}
        className="w-full max-w-md rounded-[22px] border border-texto/10 bg-fondo p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] [animation:confirm-pop_180ms_cubic-bezier(0.22,1,0.36,1)] sm:p-7"
      >
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone === "danger" ? "bg-rojo/15 text-rojo" : "bg-amarillo/20 text-amarillo"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="font-heading text-[20px] leading-tight text-texto">
              {title}
            </h2>
            {message && (
              <div id={messageId} className="mt-2 font-ui text-[14px] leading-relaxed text-texto/70">
                {message}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onClose(false)}
            className="rounded-full border border-texto/30 px-5 py-2 font-ui text-[14px] text-texto transition-colors hover:bg-texto/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amarillo"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onClose(true)}
            className={`rounded-full px-5 py-2 font-ui text-[14px] font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amarillo ${
              tone === "danger" ? "bg-rojo text-white" : "bg-amarillo text-[#141414]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// const { confirm, dialog } = useConfirm();
// if (await confirm({ title: "Delete this post?", tone: "danger" })) { ... }
// y renderizar {dialog} en el componente.
export function useConfirm() {
  const [request, setRequest] = useState<(ConfirmOptions & { resolve: (confirmed: boolean) => void }) | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setRequest({ ...options, resolve })),
    [],
  );

  const dialog = request ? (
    <ConfirmDialog
      {...request}
      onClose={(confirmed) => {
        request.resolve(confirmed);
        setRequest(null);
      }}
    />
  ) : null;

  return { confirm, dialog };
}

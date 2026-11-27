"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ApiError, emailPreviewUrl, sendEventInvitations } from "@/lib/api";

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
const MAX_RECIPIENTS = 200;

// Separa la lista pegada (comas, punto y coma, espacios o lineas) y quita
// los repetidos.
function parseEmails(text: string) {
  const items = text
    .split(/[\s,;]+/)
    .map((item) => item.trim().replace(/^<|>$/g, ""))
    .filter(Boolean);
  const unique = [...new Set(items.map((item) => item.toLowerCase()))];
  return { valid: unique.filter((item) => EMAIL.test(item)), invalid: unique.filter((item) => !EMAIL.test(item)) };
}

const FIELD =
  "mt-1 w-full rounded-[10px] border border-texto/20 bg-superficie px-3 py-2 font-ui text-[14px] text-texto outline-none transition-colors placeholder:text-texto/35 focus:border-amarillo";

// Ventana para invitar por correo a un evento: la lista de correos, un
// mensaje opcional, la vista previa del correo y enviar.
export default function InviteDialog({ eventId, eventName, onClose }: { eventId: string; eventName: string; onClose: () => void }) {
  const titleId = useId();
  const [emails, setEmails] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<number | null>(null);
  const firstRef = useRef<HTMLTextAreaElement>(null);
  const { valid, invalid } = parseEmails(emails);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    firstRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  async function send() {
    if (valid.length === 0 || invalid.length > 0 || valid.length > MAX_RECIPIENTS) return;
    setSending(true);
    setError(null);
    try {
      const result = await sendEventInvitations(eventId, valid, message.trim() || null);
      setSent(result.sent);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const preview = emailPreviewUrl("event-invitation", { eventId, ...(message.trim() ? { message: message.trim() } : {}) });

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm [animation:confirm-fade_150ms_ease-out]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !sending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !sending) onClose();
        }}
        className="my-auto w-full max-w-lg rounded-[22px] border border-texto/10 bg-fondo p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] [animation:confirm-pop_180ms_cubic-bezier(0.22,1,0.36,1)] sm:p-7"
      >
        <h2 id={titleId} className="font-heading text-[22px] leading-tight text-texto">
          Invite people to {eventName}
        </h2>

        {sent !== null ? (
          <>
            <p className="mt-3 font-ui text-[15px] text-texto">
              ✓ Invitation sent to {sent} {sent === 1 ? "person" : "people"}.
            </p>
            <p className="mt-2 font-ui text-[13px] text-texto/60">
              Email delivery isn&apos;t connected yet, so for now the invitations are only recorded by the server.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSent(null);
                  setEmails("");
                }}
                className="rounded-full border border-texto/30 px-5 py-2 font-ui text-[14px] text-texto hover:bg-texto/[0.06]"
              >
                Invite more
              </button>
              <button type="button" onClick={onClose} className="rounded-full bg-amarillo px-5 py-2 font-ui text-[14px] font-medium text-[#141414] hover:opacity-90">
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 font-ui text-[13px] text-texto/60">Each person receives the “You&apos;re invited” email with a button to register.</p>
            <label className="mt-5 block">
              <span className="block font-ui text-[12px] uppercase tracking-wide text-texto/55">Emails</span>
              <textarea
                ref={firstRef}
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={5}
                placeholder={"ana@example.com, ben@example.com\nor one per line"}
                className={FIELD}
              />
              <span className="mt-1 block font-ui text-[12px] text-texto/50">
                {valid.length} {valid.length === 1 ? "recipient" : "recipients"}
                {valid.length > MAX_RECIPIENTS && <span className="text-rojo"> · up to {MAX_RECIPIENTS} at a time</span>}
              </span>
              {invalid.length > 0 && (
                <span className="mt-1 block font-ui text-[12px] text-rojo">
                  Not valid: {invalid.slice(0, 5).join(", ")}
                  {invalid.length > 5 && ` and ${invalid.length - 5} more`}
                </span>
              )}
            </label>
            <label className="mt-4 block">
              <span className="block font-ui text-[12px] uppercase tracking-wide text-texto/55">Message (optional)</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={3000}
                placeholder="Leave it empty to use the start of the event description."
                className={FIELD}
              />
            </label>
            {error && <p className="mt-3 font-ui text-[13px] text-rojo">{error}</p>}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <a href={preview} target="_blank" rel="noopener noreferrer" className="font-ui text-[13px] text-primario underline-offset-2 hover:underline">
                Preview email ↗
              </a>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={sending}
                  className="rounded-full border border-texto/30 px-5 py-2 font-ui text-[14px] text-texto hover:bg-texto/[0.06] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || valid.length === 0 || invalid.length > 0 || valid.length > MAX_RECIPIENTS}
                  className="rounded-full bg-primario px-5 py-2 font-ui text-[14px] font-medium text-white hover:bg-primario-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Sending…" : `Send ${valid.length > 0 ? valid.length : ""} invitation${valid.length === 1 ? "" : "s"}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

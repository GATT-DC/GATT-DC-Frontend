"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import BlogImage from "@/components/blog/BlogImage";
import BlogTour from "@/components/blog/BlogTour";
import { BLOG, BlogSheet, HeroCollage, LinkedInBoxIcon, StampCard } from "@/components/blog/BlogParts";
import ScriptText, { plainText } from "@/components/blog/ScriptText";
import { FormError } from "@/components/auth/ui";
import {
  ApiError,
  createBlogPost,
  deleteBlogPost,
  updateBlogPost,
  type BlogPost,
  type BlogPostInput,
  type BlogStatus,
} from "@/lib/api";

// Editor de blogs para admins, sobre el mismo diseño con el que se publica:
// cada texto e imagen se edita en su lugar.

const MAX_HERO = 5;
const MAX_PANELISTS = 24;
const MAX_SECTIONS = 30;
const LINKEDIN_URL = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/\S+$/i;

const SMALL_BUTTON =
  "inline-flex items-center gap-1.5 rounded-full border border-texto/40 px-4 py-1.5 font-ui text-[13px] text-texto transition-colors hover:bg-texto/[0.06] disabled:cursor-not-allowed disabled:opacity-40";
const ADD_BUTTON =
  "flex w-full items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-texto/25 px-4 py-4 font-ui text-[14px] text-texto/60 transition-colors hover:border-naranja hover:text-naranja disabled:cursor-not-allowed disabled:opacity-40";
// Botones redondos sobre las imagenes y tarjetas.
const ROUND_BUTTON =
  "flex h-8 w-8 items-center justify-center rounded-full bg-[#141414]/85 font-ui text-[13px] text-white shadow transition-colors hover:bg-naranja disabled:opacity-30 disabled:hover:bg-[#141414]/85";
const SMALL_ROUND = ROUND_BUTTON.replace("h-8 w-8", "h-6 w-6").replace("text-[13px]", "text-[11px]");

// Formulario: los textos vacios se guardan como "" y al enviar pasan a null.
// Cada seccion y panelista lleva una clave local para React.
type SectionForm = { key: number; title: string; body: string };
type PanelistForm = { key: number; name: string; imageUrl: string; linkedinUrl: string };
type PostForm = {
  title: string;
  subtitle: string;
  eyebrow: string;
  metaLabel: string;
  authorName: string;
  summary: string;
  coverImageUrl: string;
  heroImageUrls: string[];
  sections: SectionForm[];
  panelists: PanelistForm[];
  // Cuantas secciones de texto van antes de "Our Panelists".
  panelistsAt: number;
};

let nextKey = 1;
const newKey = () => nextKey++;
const emptySection = (): SectionForm => ({ key: newKey(), title: "", body: "" });
const emptyPanelist = (): PanelistForm => ({ key: newKey(), name: "", imageUrl: "", linkedinUrl: "" });

function toForm(post?: BlogPost): PostForm {
  if (!post) {
    return {
      title: "",
      subtitle: "",
      eyebrow: "",
      metaLabel: "",
      authorName: "",
      summary: "",
      coverImageUrl: "",
      heroImageUrls: [],
      sections: [emptySection()],
      panelists: [],
      panelistsAt: 1,
    };
  }
  return {
    title: post.title,
    subtitle: post.subtitle ?? "",
    eyebrow: post.eyebrow ?? "",
    metaLabel: post.metaLabel ?? "",
    authorName: post.authorName ?? "",
    summary: post.summary ?? "",
    coverImageUrl: post.coverImageUrl ?? "",
    heroImageUrls: post.heroImageUrls,
    sections: post.sections.map((section) => ({ key: newKey(), title: section.title, body: section.body })),
    panelists: post.panelists.map((panelist) => ({
      key: newKey(),
      name: panelist.name,
      imageUrl: panelist.imageUrl ?? "",
      linkedinUrl: panelist.linkedinUrl ?? "",
    })),
    panelistsAt: Math.min(post.panelistsPosition ?? post.sections.length, post.sections.length),
  };
}

const orNull = (value: string) => value.trim() || null;
// Quita la barra inicial que se cuela al copiar rutas del bucket.
const cleanPath = (value: string) => value.trim().replace(/^\/+/, "");

function toInput(form: PostForm, status: BlogStatus): BlogPostInput {
  return {
    title: form.title.trim(),
    subtitle: orNull(form.subtitle),
    eyebrow: orNull(form.eyebrow),
    metaLabel: orNull(form.metaLabel),
    authorName: orNull(form.authorName),
    summary: orNull(form.summary),
    coverImageUrl: orNull(cleanPath(form.coverImageUrl)),
    heroImageUrls: form.heroImageUrls.map(cleanPath).filter(Boolean),
    status,
    sections: form.sections.map((section) => ({ title: section.title.trim(), body: section.body.trim() })),
    panelists: form.panelists.map((panelist) => ({
      name: panelist.name.trim(),
      imageUrl: orNull(cleanPath(panelist.imageUrl)),
      linkedinUrl: orNull(panelist.linkedinUrl),
    })),
    panelistsPosition: form.panelistsAt,
  };
}

// Lo que falta antes de guardar, en palabras del editor (o null si esta bien).
function problem(form: PostForm): string | null {
  if (!form.title.trim()) return "Add a title to the post.";
  for (const [i, section] of form.sections.entries()) {
    if (!section.title.trim() || !section.body.trim()) return `Section ${i + 1} needs a title and some text (or remove it).`;
  }
  for (const [i, panelist] of form.panelists.entries()) {
    if (!panelist.name.trim()) return `Panelist ${i + 1} needs a name (or remove the card).`;
    if (panelist.linkedinUrl.trim() && !LINKEDIN_URL.test(panelist.linkedinUrl.trim())) {
      return `The LinkedIn link of ${panelist.name.trim()} must look like https://www.linkedin.com/in/name`;
    }
  }
  return null;
}

function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

// Area de texto que crece con su contenido, para que se vea como el texto
// publicado. singleLine: Enter no agrega saltos de linea.
function AutoTextarea({
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
function EditableText({
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

function ImageIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5-5-9 9" />
    </svg>
  );
}

// Imagen editable: el boton de la esquina abre el campo con la ruta en S3.
function ImageSlot({
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

// Tarjeta de panelista editable: foto, nombre y LinkedIn.
function PanelistEditor({
  panelist,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  panelist: PanelistForm;
  index: number;
  count: number;
  onChange: (changes: Partial<PanelistForm>) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const [editingLink, setEditingLink] = useState(false);
  const who = panelist.name.trim() || `panelist ${index + 1}`;
  const hasLink = panelist.linkedinUrl.trim() !== "";
  return (
    <li className={BLOG.panelistCard}>
      <ImageSlot
        path={panelist.imageUrl}
        onChange={(imageUrl) => onChange({ imageUrl })}
        label={`Photo of ${who}`}
        className={BLOG.panelistPhoto}
        onLight
        tools={
          <>
            <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className={ROUND_BUTTON} aria-label={`Move ${who} left`}>
              ←
            </button>
            <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className={ROUND_BUTTON} aria-label={`Move ${who} right`}>
              →
            </button>
            <button type="button" onClick={onRemove} className={ROUND_BUTTON} aria-label={`Remove ${who}`}>
              ✕
            </button>
          </>
        }
      >
        <div className={BLOG.panelistShade} />
        <div className={BLOG.panelistText}>
          <EditableText
            value={panelist.name}
            onChange={(name) => onChange({ name })}
            placeholder="Name"
            label={`Name of panelist ${index + 1}`}
            className={BLOG.panelistName}
            onYellow
            maxLength={120}
          />
          <p className={BLOG.panelistRole}>Panelist</p>
        </div>
        <button
          type="button"
          onClick={() => setEditingLink((v) => !v)}
          aria-expanded={editingLink}
          aria-label={`LinkedIn of ${who}`}
          title={hasLink ? "Change LinkedIn link" : "Add LinkedIn link"}
          className={`absolute right-2 top-12 rounded-[5px] transition-opacity hover:opacity-80 ${
            hasLink ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]" : "bg-[#141414]/35 text-white/90 outline-dashed outline-2 outline-offset-1 outline-[#141414]/50"
          }`}
        >
          <LinkedInBoxIcon />
        </button>
      </ImageSlot>
      {editingLink && (
        <label className="mx-1 mb-1 mt-2 block font-ui text-[11px] uppercase tracking-wide text-[#141414]/70">
          LinkedIn link
          <input
            autoFocus
            type="url"
            value={panelist.linkedinUrl}
            onChange={(e) => onChange({ linkedinUrl: e.target.value })}
            onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && setEditingLink(false)}
            placeholder="https://www.linkedin.com/in/…"
            maxLength={500}
            className="mt-1 block w-full border-b border-[#141414]/40 bg-transparent pb-1 font-ui text-[13px] normal-case tracking-normal text-[#141414] outline-none placeholder:text-[#141414]/40 focus:border-[#141414]"
          />
        </label>
      )}
    </li>
  );
}

export default function BlogEditor({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [form, setForm] = useState<PostForm>(() => toForm(post));
  const [saving, setSaving] = useState<BlogStatus | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Fotos recien agregadas: abren su campo de ruta de una vez.
  const [newHero, setNewHero] = useState<number | null>(null);
  const published = post?.status === "published";

  const set = (changes: Partial<PostForm>) => setForm((current) => ({ ...current, ...changes }));
  const setSection = (i: number, changes: Partial<SectionForm>) =>
    set({ sections: form.sections.map((s, j) => (j === i ? { ...s, ...changes } : s)) });
  const setPanelist = (i: number, changes: Partial<PanelistForm>) =>
    set({ panelists: form.panelists.map((p, j) => (j === i ? { ...p, ...changes } : p)) });

  // Bloques en el orden en que se ven: las secciones de texto y, en su
  // posicion, "Our Panelists" (null).
  const blocks: (SectionForm | null)[] = [...form.sections];
  blocks.splice(form.panelistsAt, 0, null);
  const moveBlock = (b: number, delta: number) => {
    const moved = move(blocks, b, delta);
    set({ sections: moved.filter((block): block is SectionForm => block !== null), panelistsAt: moved.indexOf(null) });
  };
  const removeSection = (i: number) =>
    set({
      sections: form.sections.filter((_, j) => j !== i),
      panelistsAt: i < form.panelistsAt ? form.panelistsAt - 1 : form.panelistsAt,
    });

  async function save(status: BlogStatus) {
    const issue = problem(form);
    if (issue) {
      setError(issue);
      return;
    }
    setError(null);
    setSaving(status);
    try {
      const input = toInput(form, status);
      const saved = post ? await updateBlogPost(post.id, input) : await createBlogPost(input);
      router.push(`/blog/${saved.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setSaving(null);
    }
  }

  async function remove() {
    if (!post || !window.confirm(`Delete "${plainText(post.title)}"? This can't be undone.`)) return;
    setError(null);
    setSaving("delete");
    try {
      await deleteBlogPost(post.id);
      router.push("/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setSaving(null);
    }
  }

  const hero = form.heroImageUrls;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 rounded-[14px] bg-texto/[0.06] px-4 py-3">
        <p className="font-ui text-[14px] text-texto/75">
          This is how the post will look. Click any text to change it, and the <ImageIcon className="inline-block h-4 w-4 align-[-3px]" /> button
          to set an image. Wrap words in <strong>*asterisks*</strong> to show them in <span className="font-script text-[1.3em]">script</span>.
          Press <strong>?</strong> for a step-by-step guide.
        </p>
        <BlogTour />
      </div>

      {/* Tarjeta del listado: la portada solo se ve aqui. */}
      <section data-tour="card" className="mb-8 flex flex-col gap-6 rounded-[22px] bg-superficie p-5 sm:flex-row sm:items-center sm:p-7">
        <div className="w-full max-w-[240px] shrink-0">
          <StampCard
            number={1}
            title={plainText(form.title)}
            subtitle={orNull(plainText(form.subtitle))}
            draft={!published}
            cover={
              <ImageSlot path={form.coverImageUrl} onChange={(coverImageUrl) => set({ coverImageUrl })} label="Cover image" className="h-full w-full" onLight />
            }
          />
        </div>
        <div>
          <h2 className="font-heading text-[22px] text-texto">Card in the blog list</h2>
          <p className="mt-2 max-w-md font-ui text-[14px] text-texto/65">
            Members see this card in <em>Our blogs</em>. Set its cover image here; the title and the subtitle come from the post below.
          </p>
        </div>
      </section>

      <BlogSheet>
        <div className="mx-auto max-w-5xl">
          <header className="space-y-3">
            <div data-tour="header" className="space-y-3">
            <EditableText
              value={form.eyebrow}
              onChange={(eyebrow) => set({ eyebrow })}
              placeholder="Label above the title (optional), e.g. Latest Event Highlights"
              label="Label above the title"
              className={BLOG.eyebrow}
              maxLength={100}
            />
            <EditableText
              value={form.title}
              onChange={(title) => set({ title })}
              placeholder="Title of the post"
              label="Title"
              className={BLOG.title}
              script
              maxLength={200}
            />
            <EditableText
              value={form.subtitle}
              onChange={(subtitle) => set({ subtitle })}
              placeholder="Subtitle (optional), e.g. An Evening of *insight* and *dialogue*"
              label="Subtitle"
              className={BLOG.subtitle}
              script
              maxLength={200}
            />

            </div>
            <div className="pt-5" data-tour="hero">
              {hero.length > 0 ? (
                <HeroCollage
                  count={hero.length}
                  renderPhoto={(i) => (
                    <ImageSlot
                      path={hero[i]}
                      onChange={(value) => set({ heroImageUrls: hero.map((p, j) => (j === i ? value : p)) })}
                      label={`Header photo ${i + 1}`}
                      className="h-full w-full"
                      onLight
                      compact
                      startOpen={newHero === i}
                      tools={
                        <>
                          <button type="button" onClick={() => set({ heroImageUrls: move(hero, i, -1) })} disabled={i === 0} className={SMALL_ROUND} aria-label={`Move header photo ${i + 1} earlier`}>
                            ←
                          </button>
                          <button type="button" onClick={() => set({ heroImageUrls: move(hero, i, 1) })} disabled={i === hero.length - 1} className={SMALL_ROUND} aria-label={`Move header photo ${i + 1} later`}>
                            →
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewHero(null);
                              set({ heroImageUrls: hero.filter((_, j) => j !== i) });
                            }}
                            className={SMALL_ROUND}
                            aria-label={`Remove header photo ${i + 1}`}
                          >
                            ✕
                          </button>
                        </>
                      }
                    />
                  )}
                />
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setNewHero(hero.length);
                  set({ heroImageUrls: [...hero, ""] });
                }}
                disabled={hero.length >= MAX_HERO}
                className={`${ADD_BUTTON} ${hero.length > 0 ? "mt-6" : "aspect-[16/5]"}`}
              >
                <ImageIcon /> Add header photo ({hero.length}/{MAX_HERO})
              </button>
            </div>

            <div data-tour="meta" className={`${BLOG.textPanel} mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-baseline ${BLOG.meta}`}>
              <EditableText
                value={form.metaLabel}
                onChange={(metaLabel) => set({ metaLabel })}
                placeholder="Extra label (optional), e.g. GATT DC | Event Recap | Washington, D.C."
                label="Extra label"
                className={BLOG.meta}
                maxLength={200}
              />
              <div className="flex items-baseline gap-2">
                <span className={BLOG.byLabel}>by:</span>
                <div className="min-w-[160px]">
                  <EditableText
                    value={form.authorName}
                    onChange={(authorName) => set({ authorName })}
                    placeholder="Author (optional)"
                    label="Author"
                    className={BLOG.author}
                    maxLength={120}
                  />
                </div>
              </div>
            </div>
            <div data-tour="summary" className={`${BLOG.textPanel} mt-6`}>
              <EditableText
                value={form.summary}
                onChange={(summary) => set({ summary })}
                placeholder="Short introduction (optional). It appears below the header."
                label="Summary"
                className={BLOG.summary}
                multiline
                maxLength={2000}
              />
            </div>
          </header>

          <div className="mt-10 space-y-10" data-tour="blocks">
            {/* Secciones de texto y "Our Panelists", en el orden que se quiera. */}
            {blocks.map((section, b) => {
              const tools = (label: string, onRemove?: () => void) => (
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => moveBlock(b, -1)} disabled={b === 0} className={ROUND_BUTTON} aria-label={`Move ${label} up`}>
                    ↑
                  </button>
                  <button type="button" onClick={() => moveBlock(b, 1)} disabled={b === blocks.length - 1} className={ROUND_BUTTON} aria-label={`Move ${label} down`}>
                    ↓
                  </button>
                  {onRemove && (
                    <button type="button" onClick={onRemove} className={ROUND_BUTTON} aria-label={`Remove ${label}`}>
                      ✕
                    </button>
                  )}
                </div>
              );

              if (!section) {
                return (
                  <section key="panelists" data-tour="panelists">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="font-ui text-[12px] uppercase tracking-wide text-texto/40">Panelists</span>
                      {tools("Our Panelists")}
                    </div>
                    <h2 className={BLOG.sectionTitle}>
                      Our <span className="font-script text-[1.2em]">Panelists</span>
                    </h2>
                    {form.panelists.length === 0 && (
                      <p className="mt-1 font-ui text-[13px] text-texto/50">This section stays hidden until you add a panelist.</p>
                    )}
                    <ul className={`${BLOG.panelistGrid} mt-5`}>
                      {form.panelists.map((panelist, i) => (
                        <PanelistEditor
                          key={panelist.key}
                          panelist={panelist}
                          index={i}
                          count={form.panelists.length}
                          onChange={(changes) => setPanelist(i, changes)}
                          onMove={(delta) => set({ panelists: move(form.panelists, i, delta) })}
                          onRemove={() => set({ panelists: form.panelists.filter((_, j) => j !== i) })}
                        />
                      ))}
                      {form.panelists.length < MAX_PANELISTS && (
                        <li>
                          <button
                            type="button"
                            onClick={() => set({ panelists: [...form.panelists, emptyPanelist()] })}
                            className={`${ADD_BUTTON} h-full min-h-[200px] flex-col`}
                          >
                            <span className="text-[28px] leading-none">+</span>
                            Add panelist
                          </button>
                        </li>
                      )}
                    </ul>
                  </section>
                );
              }

              const i = form.sections.indexOf(section);
              return (
                <section key={section.key} className={BLOG.textPanel}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-ui text-[12px] uppercase tracking-wide text-texto/40">Section {i + 1}</span>
                    {tools(`section ${i + 1}`, () => removeSection(i))}
                  </div>
                  <EditableText
                    value={section.title}
                    onChange={(title) => setSection(i, { title })}
                    placeholder="Section title, e.g. An Evening of *Meaningful* Conversations"
                    label={`Title of section ${i + 1}`}
                    className={BLOG.sectionTitle}
                    script
                    maxLength={200}
                  />
                  <div className="mt-4">
                    <EditableText
                      value={section.body}
                      onChange={(body) => setSection(i, { body })}
                      placeholder="Write the text here. Leave a blank line between paragraphs."
                      label={`Text of section ${i + 1}`}
                      className={BLOG.sectionBody}
                      multiline
                      maxLength={10000}
                    />
                  </div>
                </section>
              );
            })}
            <button
              type="button"
              onClick={() => set({ sections: [...form.sections, emptySection()] })}
              disabled={form.sections.length >= MAX_SECTIONS}
              className={ADD_BUTTON}
            >
              + Add section
            </button>
          </div>
        </div>
      </BlogSheet>

      {/* Barra de acciones fija abajo mientras se edita. */}
      <div data-tour="actions" className="sticky bottom-0 z-10 mt-8 border-t border-texto/10 bg-fondo/95 py-4 backdrop-blur">
        {error && (
          <div className="mb-3">
            <FormError>{error}</FormError>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => save("published")} disabled={saving !== null} className={BLOG.button}>
              {saving === "published" ? "Saving…" : published ? "Save changes" : "Publish"}
            </button>
            <button type="button" onClick={() => save("draft")} disabled={saving !== null} className={BLOG.buttonOutline}>
              {saving === "draft" ? "Saving…" : published ? "Unpublish (move to drafts)" : "Save draft"}
            </button>
            <Link href={post ? `/blog/${post.slug}` : "/blog"} className="font-ui text-[14px] text-texto/70 hover:underline">
              Cancel
            </Link>
          </div>
          {post && (
            <button type="button" onClick={remove} disabled={saving !== null} className={`${SMALL_BUTTON} border-rojo/60 text-rojo`}>
              {saving === "delete" ? "Deleting…" : "Delete post"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogImage from "@/components/blog/BlogImage";
import {
  BLOG,
  BlogSheet,
  HeroCollage,
  LinkedInBoxIcon,
} from "@/components/blog/BlogParts";
import ScriptText, { plainText } from "@/components/blog/ScriptText";
import MemberShell from "@/components/member/MemberShell";
import type { BlogSection, Panelist } from "@/lib/api";
import { requireMember } from "@/lib/member";
import { getBlogPost } from "@/lib/session";

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getBlogPost((await params).slug).catch(() => null);
  return {
    title: post ? `${plainText(post.title)} — GATT DC` : "Blog — GATT DC",
  };
}

// Tarjeta de panelista: marco amarillo; nombre, "Panelist" y LinkedIn sobre la foto.
function PanelistCard({ panelist }: { panelist: Panelist }) {
  return (
    <li className={BLOG.panelistCard}>
      <div className={BLOG.panelistPhoto}>
        <BlogImage
          path={panelist.imageUrl}
          alt={panelist.name}
          className="h-full w-full"
          onLight
        />
        <div className={BLOG.panelistShade} />
        <div className={BLOG.panelistText}>
          <p className={BLOG.panelistName}>{panelist.name}</p>
          <p className={BLOG.panelistRole}>Panelist</p>
        </div>
        {panelist.linkedinUrl && (
          <a
            href={panelist.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-2.5 top-2.5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] transition-opacity hover:opacity-80 sm:right-3.5 sm:top-3.5"
          >
            <LinkedInBoxIcon />
            <span className="sr-only">{panelist.name} on LinkedIn</span>
          </a>
        )}
      </div>
    </li>
  );
}

// Un blog completo. Los borradores solo los ven los admins (el backend
// responde 404 a los demas).
export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const { name, isAdmin } = await requireMember(`/blog/${slug}`);
  const post = await getBlogPost(slug);
  if (!post) notFound();
  const title = plainText(post.title);
  const hero = post.heroImageUrls;
  // Secciones de texto con "Our Panelists" en la posicion que eligio el admin.
  const blocks: { key: string; section: BlogSection | null }[] =
    post.sections.map((section, i) => ({ key: `s${i}`, section }));
  blocks.splice(
    Math.min(post.panelistsPosition ?? blocks.length, blocks.length),
    0,
    { key: "panelists", section: null },
  );

  return (
    <MemberShell name={name} current="/blog" isAdmin={isAdmin} footer>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-texto/40 px-4 py-1.5 font-ui text-[13px] text-texto transition-colors hover:bg-texto/[0.06]"
        >
          ← Blog Gallery
        </Link>
        {isAdmin && (
          <div className="flex items-center gap-3">
            {post.status === "draft" && (
              <span className="rounded-full bg-texto px-3 py-0.5 font-ui text-[11px] uppercase tracking-wide text-fondo">
                Draft
              </span>
            )}
            <Link href={`/blog/${post.slug}/edit`} className={BLOG.button}>
              Edit
            </Link>
          </div>
        )}
      </div>

      <BlogSheet>
        <div className="mx-auto max-w-5xl">
          <header>
            {post.eyebrow && <p className={BLOG.eyebrow}>{post.eyebrow}</p>}
            <h1 className={`${BLOG.title} mt-2`}>
              <ScriptText text={post.title} />
            </h1>
            {post.subtitle && (
              <p className={`${BLOG.subtitle} mt-2`}>
                <ScriptText text={post.subtitle} />
              </p>
            )}
            {hero.length > 0 && (
              <div className="mb-4 mt-10">
                <HeroCollage
                  count={hero.length}
                  renderPhoto={(i) => (
                    <BlogImage
                      path={hero[i]}
                      alt={`${title}, photo ${i + 1}`}
                      className="h-full w-full"
                      onLight
                    />
                  )}
                />
              </div>
            )}
            {(post.metaLabel || post.authorName) && (
              <div
                className={`${BLOG.textPanel} mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 ${BLOG.meta}`}
              >
                <span>{post.metaLabel}</span>
                {post.authorName && (
                  <span className="flex items-baseline gap-2">
                    <span className={BLOG.byLabel}>by:</span>
                    <span className={BLOG.author}>{post.authorName}</span>
                  </span>
                )}
              </div>
            )}
            {post.summary && (
              <p className={`${BLOG.textPanel} ${BLOG.summary} mt-6`}>
                {post.summary}
              </p>
            )}
          </header>

          <div className="mt-10 space-y-10">
            {blocks.map(({ key, section }) =>
              section ? (
                <section key={key} className={BLOG.textPanel}>
                  <h2 className={BLOG.sectionTitle}>
                    <ScriptText text={section.title} />
                  </h2>
                  <div className={`${BLOG.sectionBody} mt-4 space-y-4`}>
                    {section.body.split(/\n\s*\n/).map((paragraph, j) => (
                      <p key={j} className="whitespace-pre-line">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                </section>
              ) : post.panelists.length > 0 ? (
                <section key={key}>
                  <h2 className={BLOG.sectionTitle}>
                    Our{" "}
                    <span className="font-script text-[1.2em]">Panelists</span>
                  </h2>
                  <ul className={`${BLOG.panelistGrid} mt-5`}>
                    {post.panelists.map((panelist, i) => (
                      <PanelistCard key={i} panelist={panelist} />
                    ))}
                  </ul>
                </section>
              ) : null,
            )}
          </div>
        </div>
      </BlogSheet>
    </MemberShell>
  );
}

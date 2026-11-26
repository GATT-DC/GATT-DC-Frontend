import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import BlogImage from "@/components/blog/BlogImage";
import { BLOG, BlogSheet, HeroCollage, StampCard } from "@/components/blog/BlogParts";
import ScriptText, { plainText } from "@/components/blog/ScriptText";
import MemberShell from "@/components/member/MemberShell";
import type { BlogPost } from "@/lib/api";
import { requireMember } from "@/lib/member";
import { getBlogPosts } from "@/lib/session";

export const metadata: Metadata = {
  title: "Our blogs — GATT DC",
};

// Retraso de la animacion de entrada de cada elemento, uno tras otro.
const delay = (i: number) => ({ "--blog-delay": `${i * 90}ms` }) as CSSProperties;

// El blog mas reciente, como una vista previa de su cabecera.
function Featured({ post }: { post: BlogPost }) {
  const title = plainText(post.title);
  const href = `/blog/${post.slug}`;
  return (
    <div className="blog-rise">
      <BlogSheet>
        <div className="mx-auto max-w-5xl">
          <div className="flex justify-end">
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-full bg-[#141414] px-4 py-1.5 font-ui text-[13px] text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#141414]"
            >
              Read the blog <span aria-hidden="true">→</span>
            </Link>
          </div>
          <Link href={href} className="group block">
            {post.eyebrow && <p className={`${BLOG.eyebrow} mt-2`}>{post.eyebrow}</p>}
            <h2 className={`${BLOG.title} mt-2 transition-opacity group-hover:opacity-80`}>
              <ScriptText text={post.title} />
            </h2>
            {post.subtitle && (
              <p className={`${BLOG.subtitle} mt-2`}>
                <ScriptText text={post.subtitle} />
              </p>
            )}
            {post.heroImageUrls.length > 0 && (
              <div className="mt-10">
                <HeroCollage
                  count={post.heroImageUrls.length}
                  renderPhoto={(i) => (
                    <BlogImage path={post.heroImageUrls[i]} alt={`${title}, photo ${i + 1}`} className="h-full w-full" onLight />
                  )}
                />
              </div>
            )}
          </Link>
        </div>
      </BlogSheet>
    </div>
  );
}

function Stamps({ posts, offset = 0 }: { posts: BlogPost[]; offset?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {posts.map((post, i) => (
        <li key={post.id} className="blog-rise mx-auto w-full max-w-[240px]" style={delay(i + offset)}>
          <StampCard
            href={`/blog/${post.slug}`}
            number={i + 1}
            title={plainText(post.title)}
            subtitle={post.subtitle ? plainText(post.subtitle) : null}
            draft={post.status === "draft"}
            cover={<BlogImage path={post.coverImageUrl} alt="" className="h-full w-full" onLight />}
          />
        </li>
      ))}
    </ul>
  );
}

function Empty({ children }: { children: string }) {
  return <p className="rounded-[22px] bg-superficie p-8 text-center font-serif text-[16px] text-texto/70">{children}</p>;
}

// "Our blogs". Los miembros ven el blog mas reciente destacado y los demas en
// "From the Archive". Los admins tienen ademas un selector entre los
// publicados (lo mismo que ven los miembros) y los borradores.
export default async function BlogListPage({ searchParams }: PageProps<"/blog">) {
  const { name, isAdmin } = await requireMember("/blog");
  const showDrafts = isAdmin && (await searchParams).view === "drafts";
  const posts = await getBlogPosts();
  const published = posts.filter((post) => post.status === "published");
  const drafts = posts.filter((post) => post.status === "draft");
  const [featured, ...archive] = published;

  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 font-ui text-[13px] transition-colors ${active ? "bg-amarillo text-[#141414]" : "text-texto/70 hover:text-texto"}`;

  return (
    <MemberShell name={name} current="/blog" isAdmin={isAdmin}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-[44px] font-normal leading-none text-texto lg:text-[56px]">
          Our<span className="font-script ml-3 text-[1.15em]">Blogs</span>
        </h1>
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <nav aria-label="Blog status" className="flex rounded-full border border-texto/20 p-1">
              <Link href="/blog" aria-current={!showDrafts ? "page" : undefined} className={tab(!showDrafts)}>
                Published ({published.length})
              </Link>
              <Link href="/blog?view=drafts" aria-current={showDrafts ? "page" : undefined} className={tab(showDrafts)}>
                Drafts ({drafts.length})
              </Link>
            </nav>
            <Link href="/blog/new" className={BLOG.button}>
              + New post
            </Link>
          </div>
        )}
      </div>

      {showDrafts ? (
        drafts.length === 0 ? (
          <Empty>There are no drafts. Posts saved with “Save draft” appear here.</Empty>
        ) : (
          <>
            <p className="mb-6 font-ui text-[14px] text-texto/60">Only admins can see drafts. Open one to finish and publish it.</p>
            <Stamps posts={drafts} />
          </>
        )
      ) : !featured ? (
        <Empty>There are no blog posts yet. Check back soon.</Empty>
      ) : (
        <>
          <Featured post={featured} />
          {archive.length > 0 && (
            <section className="mt-16">
              <h2 className="blog-rise font-heading border-b border-texto/15 pb-4 text-[36px] font-normal leading-none text-texto lg:text-[44px]" style={delay(2)}>
                From the<span className="font-script ml-3 text-[1.15em]">Archive</span>
              </h2>
              <div className="mt-8">
                <Stamps posts={archive} offset={3} />
              </div>
            </section>
          )}
        </>
      )}
    </MemberShell>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogEditor from "@/components/blog/BlogEditor";
import MemberShell from "@/components/member/MemberShell";
import { requireMember } from "@/lib/member";
import { getBlogPost } from "@/lib/session";

export const metadata: Metadata = {
  title: "Edit blog post — GATT DC",
};

// Editar un blog. Solo admins; a los demas la pagina no existe.
export default async function EditBlogPostPage({ params }: PageProps<"/blog/[slug]/edit">) {
  const { slug } = await params;
  const { name, isAdmin } = await requireMember(`/blog/${slug}/edit`);
  if (!isAdmin) notFound();
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <MemberShell name={name} current="/blog">
      <h1 className="font-heading mb-6 text-[40px] font-normal leading-none text-amarillo lg:text-[48px]">
        <span className="font-script mr-4 text-[1.15em]">Edit</span>blog post
      </h1>
      <BlogEditor post={post} />
    </MemberShell>
  );
}

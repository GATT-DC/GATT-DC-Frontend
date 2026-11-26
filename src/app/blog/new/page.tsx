import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogEditor from "@/components/blog/BlogEditor";
import MemberShell from "@/components/member/MemberShell";
import { requireMember } from "@/lib/member";

export const metadata: Metadata = {
  title: "New blog post — GATT DC",
};

// Crear un blog. Solo admins; a los demas la pagina no existe.
export default async function NewBlogPostPage() {
  const { name, isAdmin } = await requireMember("/blog/new");
  if (!isAdmin) notFound();

  return (
    <MemberShell name={name} current="/blog" isAdmin={isAdmin}>
      <h1 className="font-heading mb-6 text-[40px] font-normal leading-none text-amarillo lg:text-[48px]">
        <span className="font-script mr-4 text-[1.15em]">New</span>blog post
      </h1>
      <BlogEditor />
    </MemberShell>
  );
}

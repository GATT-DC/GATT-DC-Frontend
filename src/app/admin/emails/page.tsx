import type { Metadata } from "next";
import Link from "next/link";
import MemberShell from "@/components/member/MemberShell";
import { requireAdmin } from "@/lib/admin";
import { emailPreviewUrl } from "@/lib/api";
import { getEmailTemplates } from "@/lib/session";

export const metadata: Metadata = {
  title: "Email templates — GATT DC",
};

// Plantillas de correo para los admins: cada una con su asunto, cuando se
// envia y la vista previa tal como llega (en ancho de escritorio o celular).
export default async function EmailTemplatesPage({ searchParams }: PageProps<"/admin/emails">) {
  const { name } = await requireAdmin("/admin/emails");
  const params = await searchParams;
  const templates = await getEmailTemplates();
  const selected = templates.find((t) => t.name === params.template) ?? templates[0];
  const mobile = params.view === "mobile";
  const href = (template: string, view = mobile ? "mobile" : "") =>
    `/admin/emails?${new URLSearchParams({ template, ...(view ? { view } : {}) })}`;

  return (
    <MemberShell name={name} current="/admin/users" isAdmin>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-[40px] font-normal leading-none text-texto lg:text-[48px]">
          <span className="font-script mr-4 text-[1.15em] text-verde">Email</span>templates
        </h1>
        <Link href="/admin/users" className="font-ui text-[13px] text-primario hover:underline">
          ← Manage members
        </Link>
      </div>
      <p className="mb-8 max-w-3xl font-ui text-[14px] text-texto/65">
        These are the emails GATT DC sends. Email delivery isn&apos;t connected yet: for now they&apos;re recorded by the server, and here
        you can see exactly how they&apos;ll look.
      </p>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <nav aria-label="Email templates">
          <ul className="space-y-2">
            {templates.map((template) => (
              <li key={template.name}>
                <Link
                  href={href(template.name)}
                  aria-current={template.name === selected?.name ? "page" : undefined}
                  className={`block rounded-[14px] p-4 transition-colors ${
                    template.name === selected?.name ? "bg-verde/15 ring-1 ring-verde" : "bg-superficie hover:bg-texto/[0.08]"
                  }`}
                >
                  <span className="block font-ui text-[14px] font-medium text-texto">{template.subject}</span>
                  <span className="mt-1 block font-ui text-[12px] text-texto/60">{template.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {selected && (
          <section aria-label={`Preview: ${selected.subject}`} className="min-w-0 rounded-[22px] bg-superficie p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-ui text-[13px] text-texto/70">
                <span className="text-texto/45">Subject:</span> {selected.subject}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={href(selected.name, "")}
                  aria-current={!mobile ? "true" : undefined}
                  className={`rounded-full px-3 py-1 font-ui text-[12px] ${!mobile ? "bg-texto text-fondo" : "text-texto/70 hover:text-texto"}`}
                >
                  Desktop
                </Link>
                <Link
                  href={href(selected.name, "mobile")}
                  aria-current={mobile ? "true" : undefined}
                  className={`rounded-full px-3 py-1 font-ui text-[12px] ${mobile ? "bg-texto text-fondo" : "text-texto/70 hover:text-texto"}`}
                >
                  Mobile
                </Link>
                <a
                  href={emailPreviewUrl(selected.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 font-ui text-[12px] text-primario hover:underline"
                >
                  Open ↗
                </a>
              </div>
            </div>
            <iframe
              key={`${selected.name}-${mobile}`}
              title={`Preview of ${selected.subject}`}
              src={emailPreviewUrl(selected.name)}
              className={`mx-auto block h-[900px] w-full rounded-[10px] border border-texto/10 bg-white ${mobile ? "max-w-[390px]" : "max-w-[680px]"}`}
            />
          </section>
        )}
      </div>
    </MemberShell>
  );
}

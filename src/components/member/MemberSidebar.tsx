import Link from "next/link";

type Section = {
  script: string;
  word: string;
  color: string;
  href?: string;
};

// Carpetas del area de miembros. "Community hub" aun no existe; se muestra
// como proxima.
const SECTIONS: Section[] = [
  { script: "My", word: "profile", color: "var(--color-naranja)", href: "/profile" },
  { script: "Coming", word: "events", color: "var(--color-morado)", href: "/events" },
  { script: "Our", word: "blog", color: "var(--color-amarillo)", href: "/blog" },
  { script: "Community", word: "hub", color: "var(--color-primario)" },
];

// Solo para admins: el panel para gestionar usuarios.
const ADMIN_SECTION: Section = { script: "Manage", word: "members", color: "var(--color-verde)", href: "/admin/users" };

// Carpeta de color con su pestaña. La de la seccion actual asoma una hoja.
function Folder({ section, active }: { section: Section; active: boolean }) {
  const back = `color-mix(in srgb, ${section.color} 72%, black)`;
  return (
    <span className="relative block h-[70px] w-[100px] shrink-0 lg:h-[80px] lg:w-[116px]">
      <span className="absolute left-0 top-0 h-3 w-[42%] rounded-t-md" style={{ backgroundColor: back }} />
      <span className="absolute inset-x-0 bottom-0 top-2 rounded-md" style={{ backgroundColor: back }} />
      {active && <span className="absolute inset-x-2 top-3 h-5 rounded-sm bg-white/90" />}
      <span
        className="absolute inset-x-0 bottom-0 top-5 flex items-center justify-center rounded-md px-1 text-center text-white shadow-[0_3px_8px_rgba(0,0,0,0.25)]"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${section.color} 85%, white), ${section.color})`,
        }}
      >
        <span className="font-heading text-[13px] leading-none lg:text-[15px]">
          <span className="font-script text-[1.3em]">{section.script}</span> {section.word}
        </span>
      </span>
    </span>
  );
}

export default function MemberSidebar({ current, isAdmin = false }: { current: string; isAdmin?: boolean }) {
  const sections = isAdmin ? [...SECTIONS, ADMIN_SECTION] : SECTIONS;
  return (
    <nav aria-label="Member sections">
      <ul className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] lg:flex-col lg:gap-7 lg:overflow-visible lg:pb-0">
        {sections.map((section) => {
          const label = `${section.script} ${section.word}`;
          const active = section.href === current;
          return (
            <li key={label}>
              {section.href ? (
                <Link
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  className="block rounded-md transition-transform hover:-translate-y-0.5"
                >
                  <Folder section={section} active={active} />
                </Link>
              ) : (
                <span title="Coming soon" aria-disabled="true" className="block cursor-default opacity-90">
                  <Folder section={section} active={false} />
                  <span className="sr-only">{label} (coming soon)</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

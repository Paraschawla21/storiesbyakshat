import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import Logo from "@/components/layout/Logo";
import AdminNavLinks from "@/components/admin/AdminNavLinks";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/galleries", label: "Galleries" },
  { href: "/admin/editorial", label: "Photography & Films" },
  { href: "/admin/content", label: "Site Content" },
  { href: "/admin/journal", label: "Journal" },
  { href: "/admin/messages", label: "Messages" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-linen">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-ink/10 bg-paper p-6 md:flex">
        <Logo className="mb-8" />
        <nav className="flex flex-col gap-1">
          <AdminNavLinks links={links} variant="sidebar" />
        </nav>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
          className="mt-auto"
        >
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rosewood hover:bg-linen">
            Sign Out
          </button>
        </form>
      </aside>

      <div className="flex-1">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-ink/10 bg-paper px-4 py-3 md:hidden">
          <Logo />
          <nav className="flex gap-3 text-sm">
            <AdminNavLinks links={links} variant="mobile" />
          </nav>
        </div>

        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}

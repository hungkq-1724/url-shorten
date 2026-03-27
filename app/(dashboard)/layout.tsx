export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">URL Shorten</h1>
        <nav className="flex gap-4 text-sm font-medium">
          <a
            href="/dashboard"
            className="hover:text-cyan focus:outline-none focus:ring-2 focus:ring-cyan rounded"
          >
            Dashboard
          </a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

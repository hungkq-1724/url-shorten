export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Create link skeleton */}
      <section>
        <div className="h-6 w-40 rounded bg-gray-100" />
        <div className="mt-2 h-4 w-56 rounded bg-gray-100" />
        <div className="mt-4 h-32 rounded-lg bg-gray-100" />
      </section>

      {/* Links list skeleton */}
      <section>
        <div className="h-6 w-24 rounded bg-gray-100" />
        <div className="mt-2 h-4 w-44 rounded bg-gray-100" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-100" />
          ))}
        </div>
      </section>

      {/* Analytics skeleton */}
      <section>
        <div className="h-6 w-40 rounded bg-gray-100" />
        <div className="mt-4 h-24 rounded-lg bg-gray-100" />
        <div className="mt-4 h-48 rounded-lg bg-gray-100" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="h-40 rounded-lg bg-gray-100" />
          <div className="h-40 rounded-lg bg-gray-100" />
        </div>
      </section>
    </div>
  );
}

/** Placeholder shown for a moment during client navigation while page content streams in. */
export function DocsSkeleton() {
  return (
    <div className="flex items-start" aria-busy="true" aria-label="Loading">
      <div className="min-w-0 flex-1 py-8 sm:px-2 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="h-4 w-64 rounded bg-muted" />
          <div className="mt-8 h-4 w-24 rounded bg-muted" />
          <div className="mt-3 h-10 w-3/4 rounded-lg bg-muted" />
          <div className="mt-4 h-5 w-full rounded bg-muted" />
          <div className="mt-2 h-5 w-2/3 rounded bg-muted" />
          <div className="mt-10 space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-4 rounded bg-muted" style={{ width: `${92 - ((i * 13) % 30)}%` }} />
            ))}
          </div>
          <div className="mt-10 h-56 rounded-2xl bg-muted" />
        </div>
      </div>
      <div className="hidden w-64 shrink-0 py-10 pl-4 xl:block">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-28 rounded bg-muted" />
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-3 rounded bg-muted" style={{ width: `${80 - ((i * 17) % 35)}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

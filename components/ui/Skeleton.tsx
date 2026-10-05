export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-md px-5 pt-10 space-y-4" aria-busy="true" aria-live="polite">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-24 w-full" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function WorkspacePageSkeleton() {
  return (
    <section className="space-y-6" aria-label="Dang tai noi dung">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-4 w-[32rem] max-w-full" />
        </div>
        <Skeleton className="h-11 w-36" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="premium-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="size-11 rounded-lg" />
            </div>
            <Skeleton className="mt-4 h-4 w-36" />
          </div>
        ))}
      </div>

      <div className="premium-card overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <Skeleton className="h-6 w-44" />
        </div>
        <div className="divide-y divide-white/10">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-7 w-72 max-w-full" />
                <div className="grid gap-2 sm:grid-cols-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

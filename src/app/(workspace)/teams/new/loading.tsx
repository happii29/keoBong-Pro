import { Skeleton } from "@/components/ui/skeleton";

export default function NewTeamLoading() {
  return (
    <main className="luxury-shell-bg min-h-svh px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-5xl items-center">
        <div className="w-full space-y-5">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-80 max-w-full" />
            <Skeleton className="h-5 w-[36rem] max-w-full" />
          </div>
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <Skeleton className="h-[360px] rounded-xl" />
            <Skeleton className="h-[520px] rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

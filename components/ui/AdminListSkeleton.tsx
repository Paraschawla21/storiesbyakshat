import Skeleton from "@/components/ui/Skeleton";

export default function AdminListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-ink/10 bg-paper p-4"
          >
            <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

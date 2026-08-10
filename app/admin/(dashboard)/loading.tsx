import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-8 h-9 w-40" />
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-12 w-36 rounded-full" />
        <Skeleton className="h-12 w-32 rounded-full" />
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>
    </div>
  );
}

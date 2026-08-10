import Skeleton from "@/components/ui/Skeleton";
import MasonrySkeleton from "@/components/ui/MasonrySkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Skeleton className="mb-4 h-6 w-24 rounded-full" />
      <Skeleton className="mb-8 h-12 w-2/3 max-w-2xl" />
      <div className="mb-10 flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <MasonrySkeleton />
    </div>
  );
}

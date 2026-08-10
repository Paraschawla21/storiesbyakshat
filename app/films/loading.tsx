import Skeleton from "@/components/ui/Skeleton";
import MasonrySkeleton from "@/components/ui/MasonrySkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Skeleton className="mb-4 h-6 w-28 rounded-full" />
      <Skeleton className="mb-4 h-12 w-2/3 max-w-2xl" />
      <Skeleton className="mb-10 h-6 w-1/2 max-w-xl" />
      <MasonrySkeleton />
    </div>
  );
}

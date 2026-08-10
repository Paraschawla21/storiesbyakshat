import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Skeleton className="mb-4 h-6 w-24 rounded-full" />
      <Skeleton className="mb-12 h-12 w-2/3 max-w-2xl" />

      <div className="flex flex-col gap-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid gap-6 sm:grid-cols-[240px_1fr]">
            <Skeleton className="aspect-4/3 w-full" />
            <div className="flex flex-col justify-center gap-3">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

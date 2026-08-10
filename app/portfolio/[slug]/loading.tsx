import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <article>
      <Skeleton className="h-[60svh] min-h-[420px] w-full rounded-none" />
      <div className="mx-auto max-w-3xl px-6 py-14">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="mt-3 h-6 w-2/3" />
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-4/3 w-full" />
        ))}
      </div>
    </article>
  );
}

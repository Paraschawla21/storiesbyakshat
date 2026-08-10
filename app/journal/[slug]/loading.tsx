import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Skeleton className="mb-3 h-5 w-24 rounded-full" />
      <Skeleton className="mb-4 h-10 w-full" />
      <Skeleton className="mb-8 h-6 w-40" />
      <Skeleton className="mb-10 aspect-16/9 w-full rounded-2xl" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </article>
  );
}

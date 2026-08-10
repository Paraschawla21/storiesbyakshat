import Skeleton from "@/components/ui/Skeleton";

const heights = ["h-64", "h-80", "h-56", "h-72", "h-96", "h-60"];

export default function MasonrySkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="masonry-grid">
      {[0, 1, 2].map((col) => (
        <div key={col} className="masonry-grid_column">
          {Array.from({ length: Math.ceil(count / 3) }).map((_, i) => (
            <Skeleton
              key={i}
              className={heights[(col + i) % heights.length]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

"use client";

import Masonry from "react-masonry-css";
import { ReactNode } from "react";

const breakpointColumns = {
  default: 3,
  1024: 3,
  640: 2,
  480: 1,
};

export default function MasonryGrid({ children }: { children: ReactNode }) {
  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {children}
    </Masonry>
  );
}

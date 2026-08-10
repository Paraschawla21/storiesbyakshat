/**
 * Shared geometry for the "aperture bloom" mark — six overlapping
 * shutter-blade petals meeting at a center point, forming a flower-like
 * bloom. Reads as both a camera aperture (photography) and a golden-hour
 * bloom (the site's warm, floral accent color). Paths are pre-computed
 * (not relying on SVG `transform`) for maximum compatibility with
 * Satori/ImageResponse used by Next's icon/opengraph-image routes.
 */
export function apertureBloomPaths(cx: number, cy: number, r: number): string[] {
  const paths: string[] = [];
  const petalAngle = 46; // degrees — width of each petal's outer arc

  for (let i = 0; i < 6; i++) {
    const baseAngle = i * 60 - 90; // start pointing up, then rotate around
    const a1 = ((baseAngle - petalAngle / 2) * Math.PI) / 180;
    const a2 = ((baseAngle + petalAngle / 2) * Math.PI) / 180;

    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);

    paths.push(`M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`);
  }

  return paths;
}

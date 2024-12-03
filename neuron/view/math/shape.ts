import { Vec } from './vec';

/**
 * 判断点在多边形内部
 *
 * @param point 点
 * @param points 多边形顶点
 */
export function isInPolygon(point: Vec, points: Vec[]) {
  let isIn = false;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];

    if (a.x === point.x && a.y === point.y) {
      return true;
    }
    if (a.y > point.y !== b.y > point.y) {
      const crossProduct =
        (point.x - a.x) * (b.y - a.y) - (b.x - a.x) * (point.y - a.y);
      if (crossProduct === 0) {
        return true;
      }
      if (crossProduct < 0 !== b.y < a.y) {
        isIn = !isIn;
      }
    }
  }

  return isIn;
}

/**
 * 判断点在矩形内部
 *
 * @param point 点
 * @param rect 矩形
 */
export function isInRect(
  point: Vec,
  { x, y, w, h }: { x: number; y: number; w: number; h: number },
) {
  return point.x >= x && point.x <= x + w && point.y >= y - h && point.y <= y;
}

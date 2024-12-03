import { Line, Vec, Segment } from '../math'
import { ViewModule } from '../view-module'

/**
 * 视图碰撞检测相关
 */
export class Collision extends ViewModule {
  /** 获取可视区边界线段 */
  get viewBoundary() {
    const { transform } = this.view
    const { viewWidth: w, viewHeight: h } = transform
    const p1 = transform.t(0, 0)
    const p2 = transform.t(w, 0)
    const p3 = transform.t(w, h)
    const p4 = transform.t(0, h)
    const top = new Segment(p1, p2)
    const bottom = new Segment(p3, p4)
    const left = new Segment(p1, p4)
    const right = new Segment(p2, p3)
    return { top, bottom, left, right }
  }
  /** 获取可视区边界盒子 */
  get viewBoundaryRect() {
    const { transform } = this.view
    const { viewWidth: w, viewHeight: h } = transform
    const top = transform.ty(0)
    const bottom = transform.ty(h)
    const left = transform.tx(0)
    const right = transform.tx(w)
    return { top, bottom, left, right }
  }
  /** 获取直线和边界相交点 */
  crossWithBoundary(line: Line): [Vec, Vec] | undefined {
    const { top, bottom, left, right } = this.viewBoundary
    // 这里一定是上下左右的顺序，因为正好在两个相邻的边中间穿过，那就获得两个同的相交点
    const sideLines = [top, bottom, left, right]
    const crossPoints: Vec[] = []

    for (const segment of sideLines) {
      const crossPoint = segment.crossWithLine(line)
      if (crossPoint) {
        crossPoints.push(crossPoint)
      }
    }

    return crossPoints.length === 2 ? (crossPoints as [Vec, Vec]) : undefined
  }
}

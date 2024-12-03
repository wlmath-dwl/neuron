import { Vec } from './vec'

export type ParamLine = {
  a: number
  b: number
  c: number
}

export class Line {
  a: number
  b: number
  c: number
  k: number

  constructor(param: ParamLine) {
    this.a = param.a
    this.b = param.b
    this.c = param.c
    this.k = -param.a / param.b
  }

  /** 直线上的点y在x轴的对应坐标 */
  getX(y: number): number {
    const { a, b, c } = this
    if (a === 0) return Infinity
    return (-b * y - c) / a
  }

  /** 直线上的点x在y轴的对应坐标 */
  getY(x: number): number {
    const { a, b, c } = this
    if (b === 0) return Infinity
    return (-a * x - c) / b
  }

  /** 直线交点 */
  cross(line: Line): Vec | false {
    const { a: a1, b: b1, c: c1 } = line
    const { a, b, c } = this
    const detaX = b * c1 - b1 * c
    const detaY = a1 * c - a * c1
    const deta = a * b1 - a1 * b
    if (deta === 0) return false
    return new Vec(detaX / deta, detaY / deta)
  }

  /**
   * 点到直线距离
   *
   * @param point 距离直线的点
   * @param segment 是否判断在线段上
   */
  distanceToPoint(point: Vec): number {
    const { a, b, c } = this
    const { x, y } = point
    return Math.abs(x * a + b * y + c) / Math.sqrt(a * a + b * b)
  }

  /** 计算关于直线的对称点 */
  symmetryWithPoint(point: Vec) {
    const { x, y } = point
    const { a, b, c } = this
    const b2 = b * b
    const a2 = a * a
    return new Vec(((b2 - a2) * x - 2 * a * (b * y + c)) / (a2 + b2), ((a2 - b2) * y - 2 * b * (a * x + c)) / (a2 + b2))
  }
}

export class PointSlope extends Line {
  p: Vec
  constructor(p: Vec, k: number) {
    super(
      ((): ParamLine => {
        if (!isFinite(k)) {
          return {
            a: 1,
            b: 0,
            c: -p.x,
          }
        } else {
          return {
            a: -k,
            b: 1,
            c: k * p.x - p.y,
          }
        }
      })(),
    )
    this.p = p
  }
}

export class Segment extends Line {
  p1: Vec
  p2: Vec

  constructor(p1: Vec, p2: Vec) {
    super(
      ((): ParamLine => {
        const a = p2.y - p1.y
        const b = p1.x - p2.x
        const c = p2.x * p1.y - p1.x * p2.y
        return {
          a,
          b,
          c,
        }
      })(),
    )
    this.p1 = p1
    this.p2 = p2
  }
  /** 直线和线段的交点 */
  crossWithLine(line: Line): Vec | false {
    const cross = this.cross(line)
    if (!cross) return false
    const { p1, p2 } = this
    return Vec.isAcuteTriangle(p1, p2, cross) ? cross : false
  }
}

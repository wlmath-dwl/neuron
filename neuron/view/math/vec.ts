export class Vec {
  x!: number
  y!: number
  constructor(v1: Vec | number, v2: Vec | number) {
    this.set(v1, v2)
  }

  static set(x: number, y: number) {
    return new Vec(x, y)
  }

  /** 生成零向量 */
  static zero() {
    return new Vec(0, 0)
  }

  /** 是否构成锐角三角形 */
  static isAcuteTriangle(p1: Vec, p2: Vec, p3: Vec): boolean {
    const v1 = p2.del(p1)
    const v2 = p3.del(p1)
    const v3 = p3.del(p2)
    if (v1.dot(v2) < 0) return false
    if (v1.dot(v3) > 0) return false
    return true
  }

  /**
   * 通过点坐标获取角度
   *
   * @param center 中心点
   * @param side 边界点
   */
  static getAngleByPos(center: Vec, side: Vec): number {
    const { x, y } = side.del(center)
    const angle = Math.atan2(y, x)
    return angle < 0 ? 2 * Math.PI + angle : angle
  }

  /** 向量的长度 */
  get length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  /** 向量的角度 */
  get angle() {
    const radian = Math.atan2(this.y, this.x)
    return radian < 0 ? radian + Math.PI * 2 : radian
  }

  /** 点积 */
  dot(vec: Vec) {
    const { x, y } = this
    return vec.x * x + vec.y * y
  }

  /** 叉积 */
  cross(vec: Vec) {
    return this.x * vec.y - vec.x * this.y
  }

  /** 向量加 */
  add(vec: Vec) {
    const { x, y } = this
    return new Vec(x + vec.x, y + vec.y)
  }

  /** 向量减 */
  del(vec: Vec) {
    return new Vec(this.x - vec.x, this.y - vec.y)
  }

  /** 设置向量值 */
  set(v1: Vec | number, v2: Vec | number) {
    if (typeof v1 === 'number' && typeof v2 === 'number') {
      this.x = v1
      this.y = v2
    } else if (v1 instanceof Vec) {
      this.x = v1.x
      this.y = v1.y
    } else {
      throw Error('Vec设置函数参数不合法')
    }
  }

  /** 复制向量 */
  clone() {
    return new Vec(this.x, this.y)
  }

  /** 向量乘数 */
  mult(num: number) {
    return new Vec(this.x * num, this.y * num)
  }

  /** 两点之间的距离 */
  distance(point: Vec) {
    return Math.sqrt((point.x - this.x) ** 2 + (point.y - this.y) ** 2)
  }

  /** 单位向量 */
  unit() {
    const len = Math.sqrt(this.x ** 2 + this.y ** 2)
    return new Vec(this.x / len, this.y / len)
  }

  /** 旋转 */
  rotate(angle: number) {
    const { x, y } = this
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return new Vec(x * cos - y * sin, x * sin + y * cos)
  }
  /** 点旋转 */
  rotateByPoint(point: Vec, radian: number) {
    return this.del(point).rotate(radian).add(point)
  }
  /** 向量夹角 */
  getAngle(v: Vec): number {
    let val = this.dot(v) / (this.length * v.length)
    if (val > 1) val = 1
    if (val < -1) val = -1
    return Math.acos(val)
  }

  /**
   * 向量投影
   *
   * @param v 被投影的向量 即投影后的向量同方向向量
   */
  projection(v: Vec): Vec {
    const val = this.length * Math.cos(this.getAngle(v))
    return v.unit().mult(val)
  }
}

import { Vec } from '../math';
import { ViewModule } from '../view-module';

/**
 * 坐标系管理
 *
 */
export class Transform extends ViewModule {
  ox = 0;
  oy = 0;

  private _viewWidth = 1;
  private _viewHeight = 1;
  private _halfViewWidth = 1;
  private _halfViewHeight = 1;
  private _density = 1 / 100;
  private _scaleSize = 100;
  private _scaleUnit = 1;

  get scaleSize() {
    return this._scaleSize;
  }
  get scaleUnit() {
    return this._scaleUnit;
  }
  get viewWidth() {
    return this._viewWidth;
  }
  get viewHeight() {
    return this._viewHeight;
  }
  get halfViewWidth() {
    return this._halfViewWidth;
  }
  get halfViewHeight() {
    return this._halfViewHeight;
  }
  set density(val: number) {
    this._density = val;
    this.updateScale();
  }
  get density(): number {
    return this._density;
  }
  /** 重置视图尺寸 */
  resize(witdh: number, height: number) {
    const { ox, oy } = this;
    const ratex = ox / this._viewWidth;
    const ratey = oy / this._viewHeight;

    this._viewWidth = witdh;
    this._viewHeight = height;
    this._halfViewWidth = Math.round(witdh * 0.5);
    this._halfViewHeight = Math.round(height * 0.5);

    this.ox = Math.round(ratex * witdh);
    this.oy = Math.round(ratey * height);
  }
  /** 格式化刻度值 */
  formateScaleTxt(val: number): string {
    const { density } = this;
    if (val === 0) return '0';
    const level = this.findMagnitude(density);
    return Number(val.toFixed(level < 0 ? -level : 0)).toString();
  }
  /** 屏幕坐标转数学坐标 */
  t(x: number, y: number): Vec {
    const { ox, oy, density, halfViewHeight, halfViewWidth } = this;
    return new Vec(
      (x - halfViewWidth - ox) * density,
      (halfViewHeight - y + oy) * density,
    );
  }
  /** 屏幕坐标x转数学坐标x */
  tx(x: number): number {
    const { ox, density, halfViewWidth } = this;
    return (x - halfViewWidth - ox) * density;
  }
  /** 屏幕坐标y转数学坐标y */
  ty(y: number): number {
    const { oy, density, halfViewHeight } = this;
    return (halfViewHeight - y + oy) * density;
  }
  /** 屏幕坐标长度转数学坐标长度 */
  tl(v: number): number {
    return v * this.density;
  }
  /** 数学坐标转屏幕坐标 */
  c(x: number, y: number): { x: number; y: number } {
    const { oy, ox, density, halfViewHeight, halfViewWidth } = this;
    return {
      x: Math.round(ox + halfViewWidth + x / density),
      y: Math.round(halfViewHeight + oy - y / density),
    };
  }
  /** 数学坐标x转屏幕坐标x */
  cx(x: number): number {
    const { ox, density, halfViewWidth } = this;
    return Math.round(ox + halfViewWidth + x / density);
  }
  /** 数学坐标y转屏幕坐标y */
  cy(y: number): number {
    const { oy, density, halfViewHeight } = this;
    return Math.round(halfViewHeight + oy - y / density);
  }
  /** 数学坐标长度转屏幕坐标长度 */
  cl(v: number): number {
    return v / this.density;
  }
  /** 更新刻度信息 */
  private updateScale() {
    const num = this.tl(100);
    const level = Math.pow(10, this.findMagnitude(num));
    const scales = [level, 2 * level, 5 * level];
    const scale = this.findClosest(scales, num);
    this._scaleSize = this.cl(scale);
    this._scaleUnit = scale;
  }
  /**
   * 获取当前100像素密度所在平方级数
   *
   * @param num 100像素密度
   * @returns 平方级数
   */
  private findMagnitude(num: number): number {
    if (num === 0) return 0;
    const level = Math.floor(Math.log10(Math.abs(num)));
    if (level < -15) return -15;
    if (level > 15) return 15;
    return level;
  }
  /** 获取数组中里目标数字最近的那个数 */
  private findClosest(arr: number[], target: number): number {
    let minDiff = Infinity;
    let closest = arr[0];

    for (const num of arr) {
      const diff = Math.abs(num - target);
      if (diff < minDiff) {
        minDiff = diff;
        closest = num;
      }
    }

    return closest;
  }
}

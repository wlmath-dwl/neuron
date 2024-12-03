import {
  PaintLine,
  PaintLines,
  PaintArc,
  PaintCircle,
  PaintPolygon,
  PaintRect,
  PaintTxt,
  PointCanvas,
  PathData,
  Rotate,
} from './type';

export interface DrawCanvasParam {
  dom: HTMLElement;
}

export default class DrawCanvas {
  witdh: number;
  height: number;

  private dom: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(param: DrawCanvasParam) {
    this.dom = param.dom;
    this.dom.style.position = 'relative';
    this.canvas = document.createElement('canvas');
    this.dom.appendChild(this.canvas);
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.pointerEvents = 'none';
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.ctx.globalAlpha = 0;
    this.witdh = 0;
    this.height = 0;
  }
  /** canvas改变尺寸 */
  resize() {
    const { canvas, ctx, dom } = this;
    const { clientWidth: w, clientHeight: h } = dom;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    this.witdh = w;
    this.height = h;
  }
  /** 清空canvas */
  clear() {
    const { ctx, dom } = this;
    const { clientWidth: w, clientHeight: h } = dom;
    ctx.clearRect(0, 0, w, h);
  }
  rotateBefore(rotate: Rotate) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(rotate.axis.x, rotate.axis.y);
    ctx.rotate(rotate.radian);
    ctx.translate(-rotate.axis.x, -rotate.axis.y);
  }
  rotateAfter() {
    const { ctx } = this;
    ctx.restore();
  }
  /** 画虚线 */
  drawDashLine(data: PaintLine) {
    const { ctx } = this;
    const { start, end, color, wide, opacity } = data;

    ctx.save();

    if (color) ctx.strokeStyle = color;
    if (wide) ctx.lineWidth = wide;
    if (opacity) ctx.globalAlpha = opacity;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.setLineDash([3, 3]);

    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);

    ctx.stroke();
    ctx.restore();
  }
  /** 画直线 */
  drawLine(data: PaintLine) {
    const { ctx } = this;
    const { start, end, color, wide, opacity } = data;

    ctx.save();

    if (color) ctx.strokeStyle = color;
    if (wide) ctx.lineWidth = wide;
    if (opacity) ctx.globalAlpha = opacity;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();

    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);

    ctx.stroke();
    ctx.restore();
  }
  /** 批量绘制多条直线，提高性能 */
  drawLines(data: PaintLines) {
    const { ctx } = this;
    const { color, wide, opacity, points } = data;
    ctx.save();

    if (color) ctx.strokeStyle = color;
    if (wide) ctx.lineWidth = wide;
    if (opacity) ctx.globalAlpha = opacity;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    const len = points.length;
    if (len <= 1) return;

    const arr: { x: number; y: number; s?: boolean }[] = [];

    for (let i = 0; i < len; ++i) {
      arr.push(points[i]);
    }

    ctx.moveTo(arr[0].x, arr[0].y);
    for (let i = 1; i < len; ++i) {
      const { x, y, s } = arr[i];
      if (s) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    ctx.restore();
  }
  /** 绘制扇形 */
  drawSector(data: PaintArc) {
    const { ctx } = this;
    const { center, start, end, color, wide, opacity, r } = data;
    if (start === end || Math.abs(start - end) === Math.PI * 2) return;

    ctx.save();
    ctx.beginPath();

    if (color) ctx.fillStyle = color;
    if (wide) ctx.lineWidth = wide;
    if (opacity) ctx.globalAlpha = opacity;
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, r, -start, -end, true);
    ctx.fill();
    ctx.restore();
  }
  /** 绘制弧形 */
  drawArc(data: PaintArc) {
    const { ctx } = this;
    const { center, start, end, color, wide, opacity, r } = data;
    if (start === end || Math.abs(start - end) === Math.PI * 2) return;

    ctx.save();
    ctx.beginPath();

    if (color) ctx.strokeStyle = color;
    if (wide) ctx.lineWidth = wide;
    if (opacity) ctx.globalAlpha = opacity;
    if (wide) ctx.lineWidth = wide;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.arc(center.x, center.y, r, -start, -end, true);
    ctx.stroke();
    ctx.restore();
  }
  /** 绘制圆 */
  drawCircle(data: PaintCircle) {
    const { center, color, wide, borderColor, opacity, r } = data;
    const { ctx } = this;

    ctx.save();
    ctx.beginPath();

    if (color) ctx.fillStyle = color;
    if (opacity) ctx.globalAlpha = opacity;
    if (borderColor) ctx.strokeStyle = borderColor;
    if (wide) ctx.lineWidth = wide;

    ctx.arc(center.x, center.y, r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    if (wide) ctx.stroke();
    ctx.restore();
  }
  /** 绘制矩形 */
  drawRect(data: PaintRect) {
    const { ctx } = this;
    const { color, opacity, x, y, w, h } = data;

    ctx.save();
    ctx.beginPath();

    if (color) ctx.fillStyle = color;
    if (opacity) ctx.globalAlpha = opacity;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  /** 绘制多边形 */
  drawPolygon(data: PaintPolygon) {
    const { ctx } = this;
    const { points, color, opacity, wide, borderColor } = data;
    const vertexs: PointCanvas[] = [];

    for (let i = 0; i < points.length; ++i) {
      vertexs.push(points[i]);
    }

    ctx.save();
    ctx.beginPath();

    if (color) ctx.fillStyle = color;
    if (opacity) ctx.globalAlpha = opacity;
    if (borderColor) ctx.strokeStyle = borderColor;
    if (wide) ctx.lineWidth = wide;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < vertexs.length; ++i) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.closePath();
    ctx.fill();
    if (wide) ctx.stroke();
    ctx.restore();
  }
  /** 绘制文本 */
  drawTxt(data: PaintTxt) {
    const { ctx } = this;
    const { context, size, alignX, alignY, color } = data;

    ctx.save();
    ctx.font = `${size || 14}px Helvetica`;
    ctx.textAlign = (alignX || 'center') as CanvasTextAlign;
    ctx.textBaseline = (alignY || 'top') as CanvasTextBaseline;
    ctx.fillStyle = color;
    const txts = Array.isArray(context) ? context : [context];
    for (let i = 0; i < txts.length; ++i) {
      const { pos, txt } = txts[i];
      ctx.fillText(txt, pos.x, pos.y);
    }

    ctx.restore();
  }
}

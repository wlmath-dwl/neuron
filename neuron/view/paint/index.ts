import DrawCanvas from './canvas';
import { Transform } from '../transform';
import {
  ShapeLine,
  ShapeLines,
  ShapeArc,
  ShapeCircle,
  ShapePolygon,
  ShapeRect,
  ShapeTxt,
  ShapeTxtContent,
  Lines,
} from './type';
import {
  PaintLine,
  PaintLines,
  PaintArc,
  PaintCircle,
  PaintPolygon,
  PaintRect,
  PaintTxt,
  Rotate,
} from './canvas/type';
import { cloneDeep } from 'lodash-es';
import { ViewModule, ViewModuleParam } from '../view-module';

export * from './type';

export interface ParamView {
  dom: HTMLElement;
  transform: Transform;
}

/**
 * 视图绘制
 *
 */
export class Paint extends ViewModule {
  drawCanvas: DrawCanvas;

  constructor(param: ViewModuleParam) {
    super(param);
    this.drawCanvas = new DrawCanvas({ dom: param.dom });
  }
  /** 清空视图 */
  clear() {
    this.drawCanvas.clear();
  }
  /** 绘制坐标系 */
  renderCoordinate() {
    const { transform } = this.view;
    const { ox, oy, viewWidth, viewHeight } = transform;
    const [hScales, vScales] = this.getScales();
    const scaleLineGap = 4;
    const halfViewWidth = Math.floor(viewWidth / 2);
    const halfViewHeight = Math.floor(viewHeight / 2);

    // 坐标轴
    const axisLines: Lines = [
      { x: '0', y: halfViewHeight + oy + '' },
      { x: viewWidth + '', y: halfViewHeight + oy + '' },
      { x: halfViewWidth + ox + '', y: '0', s: true },
      { x: halfViewWidth + ox + '', y: viewHeight + '' },
    ];

    // x轴刻度线+刻度数字
    const scaleXLines: Lines = [];
    const hTxts: ShapeTxtContent[] = [];
    for (let i = 0; i < hScales.length; ++i) {
      if (Math.abs(hScales[i] - ox - halfViewWidth) > 10) {
        scaleXLines.push(
          {
            x: hScales[i] + '',
            y: halfViewHeight + oy + '',
            s: true,
          },
          {
            x: hScales[i] + '',
            y: halfViewHeight + oy + scaleLineGap + '',
          },
        );

        hTxts.push({
          txt: transform.formateScaleTxt(transform.tx(hScales[i])),
          pos: {
            x: hScales[i] + '',
            y: halfViewHeight + oy + scaleLineGap * 2 + '',
          },
        });
      } else {
        // 数字0
        hTxts.push({
          txt: '0',
          pos: {
            x: halfViewWidth + ox - scaleLineGap * 4 + '',
            y: halfViewHeight + oy + scaleLineGap * 2 + '',
          },
        });
      }
    }

    // y轴刻度线+刻度数字
    const scaleYLines: Lines = [];
    const vTxts: ShapeTxtContent[] = [];
    for (let i = 0; i < vScales.length; ++i) {
      if (Math.abs(vScales[i] - oy - halfViewHeight) > 10) {
        scaleYLines.push(
          {
            y: vScales[i] + '',
            x: halfViewWidth + ox + '',
            s: true,
          },
          {
            y: vScales[i] + '',
            x: halfViewWidth + ox - scaleLineGap + '',
          },
        );

        vTxts.push({
          txt: transform.formateScaleTxt(transform.ty(vScales[i])),
          pos: {
            y: vScales[i] + '',
            x: halfViewWidth + ox - scaleLineGap * 2 + '',
          },
        });
      }
    }

    this.drawCanvas.clear();

    this.drawLines({
      points: [...axisLines, ...scaleXLines, ...scaleYLines],
      color: '#333',
      wide: 1,
    });

    this.drawTxt({
      context: hTxts,
      color: '#333',
      size: 14,
      alignX: 'center',
      alignY: 'top',
    });

    this.drawTxt({
      context: vTxts,
      color: '#333',
      size: 14,
      alignX: 'right',
      alignY: 'middle',
    });
  }
  /** 视图改变尺寸 */
  resize() {
    const { drawCanvas } = this;
    const { transform } = this.view;
    drawCanvas.resize();
    transform.resize(drawCanvas.witdh, drawCanvas.height);
  }
  private preRender(rotate?: Rotate) {
    if (!rotate) return;
    const { drawCanvas } = this;
    const { transform } = this.view;
    const axis = {
      x:
        typeof rotate.axis.x === 'string'
          ? parseInt(rotate.axis.x)
          : transform.cx(rotate.axis.x),
      y:
        typeof rotate.axis.y === 'string'
          ? parseInt(rotate.axis.y)
          : transform.cy(rotate.axis.y),
    };
    drawCanvas.rotateBefore({
      axis,
      radian: rotate.radian,
    });
  }
  private afterRender(rotate?: Rotate) {
    if (!rotate) return;
    const { drawCanvas } = this;
    drawCanvas.rotateAfter();
  }
  /** 绘制点线 */
  drawDashLine(data: ShapeLine, rotate?: Rotate) {
    data = cloneDeep(data);
    this.preRender(rotate);

    const { drawCanvas } = this;
    const { transform } = this.view;
    const { start, end } = data;
    data.start.x =
      typeof start.x === 'string' ? parseInt(start.x) : transform.cx(start.x);
    data.start.y =
      typeof start.y === 'string' ? parseInt(start.y) : transform.cy(start.y);
    data.end.x =
      typeof end.x === 'string' ? parseInt(end.x) : transform.cx(end.x);
    data.end.y =
      typeof end.y === 'string' ? parseInt(end.y) : transform.cy(end.y);
    drawCanvas.drawDashLine(data as PaintLine);
    this.afterRender(rotate);
  }
  /** 绘制线 */
  drawLine(data: ShapeLine, rotate?: Rotate) {
    data = cloneDeep(data);
    this.preRender(rotate);

    const { drawCanvas } = this;
    const { transform } = this.view;
    const { start, end } = data;
    data.start.x =
      typeof start.x === 'string' ? parseInt(start.x) : transform.cx(start.x);
    data.start.y =
      typeof start.y === 'string' ? parseInt(start.y) : transform.cy(start.y);
    data.end.x =
      typeof end.x === 'string' ? parseInt(end.x) : transform.cx(end.x);
    data.end.y =
      typeof end.y === 'string' ? parseInt(end.y) : transform.cy(end.y);
    drawCanvas.drawLine(data as PaintLine);
    this.afterRender(rotate);
  }
  /** 绘制多条线 */
  drawLines(data: ShapeLines, rotate?: Rotate) {
    this.preRender(rotate);
    data = cloneDeep(data);
    const { drawCanvas } = this;
    const { transform } = this.view;
    const { points } = data;

    const len = points.length;
    if (len <= 1) return;

    for (let i = 0; i < len; ++i) {
      const { x, y } = points[i];
      points[i].x = typeof x === 'string' ? parseInt(x) : transform.cx(x);
      points[i].y = typeof y === 'string' ? parseInt(y) : transform.cy(y);
    }

    drawCanvas.drawLines(data as PaintLines);
    this.afterRender(rotate);
  }
  /** 绘制扇形 */
  drawSector(data: ShapeArc, rotate?: Rotate) {
    this.preRender(rotate);
    data = cloneDeep(data);
    const { drawCanvas } = this;
    const { transform } = this.view;
    const { center, r } = data;
    center.x =
      typeof center.x === 'string'
        ? parseInt(center.x)
        : transform.cx(center.x);
    center.y =
      typeof center.y === 'string'
        ? parseInt(center.y)
        : transform.cy(center.y);
    data.r = typeof r === 'string' ? parseInt(r) : transform.cl(r);
    drawCanvas.drawSector(data as PaintArc);
    this.afterRender(rotate);
  }
  /** 绘制弧形 */
  drawArc(data: ShapeArc, rotate?: Rotate) {
    this.preRender(rotate);
    data = cloneDeep(data);

    const { drawCanvas } = this;
    const { transform } = this.view;
    const { center, r } = data;
    center.x =
      typeof center.x === 'string'
        ? parseInt(center.x)
        : transform.cx(center.x);
    center.y =
      typeof center.y === 'string'
        ? parseInt(center.y)
        : transform.cy(center.y);
    data.r = typeof r === 'string' ? parseInt(r) : transform.cl(r);
    drawCanvas.drawArc(data as PaintArc);
    this.afterRender(rotate);
  }
  /** 绘制圆形 */
  drawCircle(data: ShapeCircle, rotate?: Rotate) {
    this.preRender(rotate);
    data = cloneDeep(data);

    const { drawCanvas } = this;
    const { transform } = this.view;
    const { center, r } = data;

    center.x =
      typeof center.x === 'string'
        ? parseInt(center.x)
        : transform.cx(center.x);
    center.y =
      typeof center.y === 'string'
        ? parseInt(center.y)
        : transform.cy(center.y);
    data.r = typeof r === 'string' ? parseInt(r) : transform.cl(r);

    drawCanvas.drawCircle(data as PaintCircle);
    this.afterRender(rotate);
  }
  /** 绘制矩形 */
  drawRect(data: ShapeRect, rotate?: Rotate) {
    this.preRender(rotate);
    data = cloneDeep(data);

    const { drawCanvas } = this;
    const { transform } = this.view;
    const { x, y, w, h } = data;
    data.x = typeof x === 'string' ? parseInt(x) : transform.cx(x);
    data.y = typeof y === 'string' ? parseInt(y) : transform.cy(y);
    data.w = typeof w === 'string' ? parseInt(w) : transform.cl(w);
    data.h = typeof h === 'string' ? parseInt(h) : transform.cl(h);

    drawCanvas.drawRect(data as PaintRect);
    this.afterRender(rotate);
  }
  /** 绘制多边形 */
  drawPolygon(data: ShapePolygon, rotate?: Rotate) {
    this.preRender(rotate);
    data = cloneDeep(data);
    const { drawCanvas } = this;
    const { transform } = this.view;
    const { points } = data;

    for (let i = 0; i < points.length; ++i) {
      const { x, y } = points[i];
      points[i].x = typeof x === 'string' ? parseInt(x) : transform.cx(x);
      points[i].y = typeof y === 'string' ? parseInt(y) : transform.cy(y);
    }

    drawCanvas.drawPolygon(data as PaintPolygon);
    this.afterRender(rotate);
  }
  /** 绘制文本 */
  drawTxt(data: ShapeTxt, rotate?: Rotate) {
    data = cloneDeep(data);

    const { drawCanvas } = this;
    const { transform } = this.view;
    const { context } = data;

    for (let i = 0; i < context.length; ++i) {
      const { pos } = context[i];
      pos.x = typeof pos.x === 'string' ? parseInt(pos.x) : transform.cx(pos.x);
      pos.y = typeof pos.y === 'string' ? parseInt(pos.y) : transform.cy(pos.y);
    }

    drawCanvas.drawTxt(data as PaintTxt);
    this.afterRender(rotate);
  }
  /** 获取坐标系的刻度位置px单位 */
  private getScales(): [number[], number[]] {
    const { transform } = this.view;
    const { ox, oy, viewWidth, viewHeight, halfViewWidth, halfViewHeight } =
      transform;
    const { scaleSize } = transform;

    const hScales: number[] = [];
    const vScales: number[] = [];

    let sideX = (halfViewWidth + ox) % scaleSize;
    let sideY = (halfViewHeight + oy) % scaleSize;

    while (sideX < viewWidth) {
      hScales.push(sideX);
      sideX += scaleSize;
    }

    while (sideY < viewHeight) {
      vScales.push(sideY);
      sideY += scaleSize;
    }

    return [hScales, vScales];
  }
}

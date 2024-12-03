import { Fsm } from './fsm';
import { Vec } from '../../view';
import { ControlModuleParam, ControlModule } from '../control-module';
import { DragFsm, PlaceFsm } from './index';

export type DragEvent = MouseEvent | TouchEvent;

type DisableConf = Partial<{
  /** 是否可缩放 */
  zoom: boolean;
  /** 是否可hover */
  hover: boolean;
  /** 是否可拖动背景视图 */
  viewDrag: boolean;
  /** 是否可用 */
  disabled: boolean;
}>;

/**
 * 状态机容器，用于分发事件
 */
export class Dispatch extends ControlModule {
  FSMS: any;
  fsm?: Fsm;
  config: DisableConf = {
    zoom: true,
    hover: true,
    viewDrag: true,
    disabled: false,
  };
  private _ready = false;
  private observer?: ResizeObserver;

  constructor(param: ControlModuleParam) {
    super(param);
    this.FSMS = { DragFsm, PlaceFsm };
    this.bindEvent();
    this.changeFsm('DragFsm');
  }

  get ready() {
    return this._ready;
  }

  /**
   * 切换状态机
   * @param param 状态机构造参数，不传设置默认拖拽状态机
   */
  changeFsm(className: string, param?: unknown) {
    const { view, control, FSMS } = this;
    const fsm = new FSMS[className](param);
    fsm.view = view;
    fsm.control = control;
    this.fsm = fsm;
  }
  /**
   * 销毁状态机相关订阅事件
   */
  destory() {
    const { dom } = this;

    if ('ontouchstart' in window) {
      dom.removeEventListener('touchstart', this.dragStart);
      document.body.addEventListener('touchmove', this.drag);
      document.body.addEventListener('touchend', this.dragEnd);
    } else {
      dom.addEventListener('mousedown', this.dragStart);
      document.body.addEventListener('mousemove', this.drag);
      document.body.addEventListener('mouseup', this.dragEnd);
    }

    dom.addEventListener('wheel', this.zoom);
    // 阻止浏览器默认缩放行为
    document.body.removeEventListener('wheel', function (e) {
      e.preventDefault();
    });
  }
  private resize() {
    const { paint } = this.view;
    const { body, eventBus } = this.control;
    paint.resize();
    if (!this._ready && this.dom.clientWidth && this.dom.clientHeight) {
      eventBus.emit('ready');
      this._ready = true;
    }
    body.render();
  }
  /** 绑定初始事件 */
  private bindEvent() {
    const { dom } = this;

    this.dragStart = this.dragStart.bind(this);
    this.drag = this.drag.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.zoom = this.zoom.bind(this);
    this.resize = this.resize.bind(this);

    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(dom);

    if ('ontouchstart' in window) {
      dom.addEventListener('touchstart', this.dragStart, {
        passive: true,
      });
      document.body.addEventListener('touchmove', this.drag, { passive: true });
      document.body.addEventListener('touchend', this.dragEnd, {
        passive: true,
      });
    } else {
      dom.addEventListener('mousedown', this.dragStart);
      document.body.addEventListener('mousemove', this.drag);
      document.body.addEventListener('mouseup', this.dragEnd);
    }

    dom.addEventListener('wheel', this.zoom, { passive: false });

    // 阻止浏览器默认缩放行为
    dom.addEventListener(
      'wheel',
      function (e) {
        e.stopPropagation();
        e.preventDefault();
      },
      { passive: false },
    );
  }
  /** 获取相对视图的屏幕坐标点，兼容处理移动端 */
  private getOffsetPos(pageX: number, pageY: number): Vec {
    const { dom } = this;
    const { left, top } = dom.getBoundingClientRect();
    const x = pageX - left;
    const y = pageY - top;
    return new Vec(x, y);
  }
  /** 获取屏幕坐标和数学坐标 */
  private getTouchPoints(e: DragEvent): { screenVecs: Vec[]; mathVecs: Vec[] } {
    const screenVecs: Vec[] = [];
    const touches = (e as { touches: TouchList }).touches;
    const { transform } = this.view;

    if (touches) {
      if (touches[0])
        screenVecs.push(this.getOffsetPos(touches[0].pageX, touches[0].pageY));
      if (touches[1])
        screenVecs.push(this.getOffsetPos(touches[1].pageX, touches[1].pageY));
    } else {
      screenVecs.push(
        this.getOffsetPos((e as MouseEvent).pageX, (e as MouseEvent).pageY),
      );
    }

    const mathVecs: Vec[] = [];

    for (const it of screenVecs) {
      const { x, y } = transform.t(it.x, it.y);
      mathVecs.push(new Vec(x, y));
    }
    return {
      screenVecs,
      mathVecs,
    };
  }
  /** 响应dragStart事件 */
  private dragStart(e: DragEvent) {
    const { screenVecs, mathVecs } = this.getTouchPoints(e);
    this.fsm?.dragStart(screenVecs, mathVecs);
  }
  /** 响应drag事件 */
  private drag(e: DragEvent) {
    const { screenVecs, mathVecs } = this.getTouchPoints(e);
    this.fsm?.drag(screenVecs, mathVecs);
  }
  /** 响应dragEnd事件 */
  private dragEnd(e: DragEvent) {
    const { screenVecs, mathVecs } = this.getTouchPoints(e);
    this.fsm?.dragEnd(screenVecs, mathVecs);
  }
  /** 响应zoom事件 */
  private zoom(e: WheelEvent) {
    if (!this.config.zoom) return;
    const { screenVecs, mathVecs } = this.getTouchPoints(e);
    this.fsm?.zoom(screenVecs, mathVecs, e.deltaY > 0);
  }
}

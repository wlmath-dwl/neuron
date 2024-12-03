import { Vec } from '../../view';
import { Cell, CellParam, CPoint } from '../../model';
import { ControlModule, ControlModuleParam } from '../control-module';
import { DragFsm } from '../fsm';

export interface BodyParam {
  dom: HTMLElement;
}

interface Layer {
  name: string;
  cells: Cell[];
}

/**
 * 管理cell的容器
 */
export class Body extends ControlModule {
  CELLS: any;
  /** 坐标系绘制开关 */
  debug = true;
  /** 层容器 */
  private _layers: Layer[] = [];
  /** cell id hash快速获取cell */
  private cellMap: Record<string, Cell> = {};

  constructor(param: ControlModuleParam) {
    super(param);
    this.CELLS = { CPoint };
  }

  get layers(): Readonly<Layer[]> {
    return this._layers;
  }
  /**
   * 初始化所有层
   *
   * @param layers 层名字的数组,每个名字用作唯一标识
   */
  initLayers(layers: string[]) {
    this._layers = [];
    for (const name of layers) {
      this._layers.push({
        name,
        cells: [],
      });
    }
  }
  /**
   * 渲染所有cell和背景
   */
  render() {
    const { paint } = this.view;
    const { _layers, debug } = this;

    paint.clear();
    if (debug) paint.renderCoordinate();

    for (let i = 0; i < _layers.length; ++i) {
      const cells = _layers[i].cells;
      if (!cells?.length) continue;
      for (let j = 0; j < cells.length; ++j) {
        cells[j].render();
      }
    }
  }
  createCell<T = Cell>(param: Partial<CellParam>, add = true): T | undefined {
    const { view, control, CELLS } = this;
    const cell = new CELLS[param.name ?? '']({
      ...param,
      view,
      control,
    });
    cell.view = view;
    cell.control = control;
    if (add && cell) {
      this.addCell(cell);
    }

    return cell as T;
  }
  /**
   * 根据id获取cell
   *
   * @param id cell的id
   * @returns 返回的cell
   */
  getCell<T = Cell>(id: string): T | undefined {
    return this.cellMap[id] as T;
  }
  /**
   * 获取body中所有cells
   */
  getCells(layerName?: string): Cell[] {
    const { _layers } = this;
    const cells = _layers.find(it => it.name === layerName)?.cells ?? [];
    if (cells.length) return cells;

    for (let i = 0; i < _layers.length; ++i) {
      const layerCells = _layers[i]?.cells;
      if (!layerCells?.length) continue;
      for (let j = 0; j < layerCells.length; ++j) {
        cells.push(layerCells[j]);
      }
    }
    return cells;
  }
  /**
   * 获取body选中的cell
   *
   * @param point 选中的点
   * @param layerName 从哪个层中选择
   * @returns 选择的cell
   */
  getSelectCell<T = Cell>(
    point: Vec,
    option?: { layerName?: string; filterIds?: Set<string> },
  ): T | null {
    const { layerName, filterIds } = option ?? {};
    const cells = this.getCells(layerName);
    const index = cells.length - 1;
    for (let i = index; i >= 0; --i) {
      if (filterIds?.has(cells[i].id)) continue;
      if (cells[i].checkSelect(point)) return cells[i] as T;
    }
    return null;
  }
  /**
   * 添加cell到body
   *
   * @param cell 要添加的cell
   */
  addCell(cell?: Cell) {
    if (!cell) return;
    const { cmd } = this.control;
    const layer = this._layers.find(it => it.name === cell.layer);
    if (!layer) return;
    layer.cells.push(cell);
    this.cellMap[cell.id] = cell;
    cmd.collectCreate(cell);
    this.render();
    return cell;
  }
  /**
   * 从body中删除cell
   *
   * @param id 要添加的cell ID
   * @param root 用于递归遍历判断是否是初始删除调用
   */
  removeCell(id: string, option?: { root?: boolean; recursion?: boolean }) {
    const { root, recursion } = Object.assign(
      { root: true, recursion: true },
      option,
    );
    const cell = this.getCell(id);
    if (!cell) return;
    const { cmd, dispatch } = this.control;
    const layer = this.layers.find(it => it.name === cell.layer);
    if (!layer) return undefined;
    layer.cells = layer.cells.filter(it => it !== cell);
    delete this.cellMap[cell.id];
    // 非递归删除不向上遍历父节点
    if (!recursion) return;

    const { linkParent } = cell;

    for (const parentId of linkParent) {
      this.removeCell(parentId, { root: false, recursion });
    }

    cmd.collectDelete(cell);
    if (root) cmd.collectEnd();
    if (dispatch.fsm instanceof DragFsm) dispatch.fsm.clearCellState();
    this.render();
  }
  /**
   * 生成的6位短id
   *
   * @returns 6位短id
   */
  private generateShortId(): string {
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }

    return result;
  }
  /**
   * 生成cell ID
   *
   * @returns 在一个body中唯一的ID
   */
  private generateCellId(): string {
    let id = this.generateShortId();
    while (this.cellMap[id]) {
      id = this.generateShortId();
    }
    return id;
  }
}

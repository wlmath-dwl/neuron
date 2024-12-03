import { Vec, View } from '../view';
import { Control } from '../control';
import { cloneDeep } from 'lodash-es';
import { NS } from '../view';

export type CellData = Record<string, NS | undefined>;

export interface CellStore {
  /** cell id */
  id: string;
  /** cell 类数名 */
  name: string;
  /** cell数据 */
  data: CellData;
  /** cell子节点 */
  linkChild: Record<string, string | string[]>;
  /** cell依赖节点 */
  linkRely: Record<string, string | string[]>;
  /** cell父节点 */
  linkParent: string[];
}

export type CellParam = CellStore & { view?: View; control?: Control };

export interface CellState {
  /** 是否选中 */
  select: boolean;
  /** 是否hover */
  hover: boolean;
  /** 是否显示 */
  show: boolean;
}

export type LinkType = Record<string, string | string[]>;

/**
 * cell基类，所有操作的模型都继承cell
 */
export abstract class Cell {
  /** cell唯一id */
  id: string;
  /** cell类 */
  name: string;
  /** cell所在层级标识 */
  layer?: string;
  /** cell类型 */
  type?: string;
  /** cell状态 */
  state: CellState;
  /** view引用 */
  view: View;
  /** control引用 */
  control: Control;
  /** cell数据 */
  data: Record<string, any>;
  /** cell子节点 */
  linkChild: Record<string, string | string[]>;
  /** cell依赖节点 */
  linkRely: Record<string, string | string[]>;
  /** cell父节点 */
  linkParent: string[];
  /** render后的data快照，可用于渲染历史数据的比较处理 */
  dataSnapshot?: CellData;

  private created = false;

  constructor(param: CellParam) {
    this.id = param.id;
    this.name = param.name;
    this.state = {
      select: false,
      hover: false,
      show: true,
    };
    this.view = param.view as View;
    this.control = param.control as Control;
    this.data = this.proxyData(param?.data ?? {});
    this.linkParent = param.linkParent ?? [];
    this.linkChild = param.linkChild ?? {};
    this.linkRely = param.linkRely ?? {};

    Promise.resolve().then(() => {
      this.created = true;
      this.effectRender();
      this.effectCheckSelect();
    });
  }
  /** 渲染cell */
  abstract render(): void;
  /** 选择cell */
  abstract checkSelect(point: Vec): boolean;
  /** cell更新回调函数，可覆盖 */
  update(from?: Cell) {
    // to override
  }
  click(point: Vec) {
    // to override
  }
  static FillCellStore(store: Partial<CellStore>): CellStore {
    return Object.assign(
      {
        id: '',
        name: '',
        data: {},
        linkChild: {},
        linkRely: {},
        linkParent: {},
      },
      store,
    );
  }
  /** 清空状态 */
  clearState() {
    this.state.hover = false;
    this.state.select = false;
  }
  setLink(key: string, value: string | string[]) {
    const { body } = this.control;
    this.linkChild[key] = value;

    if (Array.isArray(value)) {
      for (const it of value) {
        const cell = body.getCell(it);
        if (!cell) continue;
        if (!cell.linkParent.includes(cell.id)) cell.linkParent.push(cell.id);
      }
    } else {
      const cell = body.getCell(value);
      if (cell && cell.linkParent.includes(this.id))
        cell.linkParent.push(this.id);
    }
  }
  setRely(key: string, value: string | string[]) {
    const { body } = this.control;
    this.linkRely[key] = value;

    if (Array.isArray(value)) {
      for (const it of value) {
        const cell = body.getCell(it);
        if (!cell) continue;
        if (!cell.linkParent.includes(cell.id)) cell.linkParent.push(cell.id);
      }
    } else {
      const cell = body.getCell(value);
      if (cell && cell.linkParent.includes(this.id))
        cell.linkParent.push(this.id);
    }
  }
  /** 获取存储数据 */
  getStore(): CellStore {
    const { id, data, name, type, layer, linkChild, linkParent, linkRely } =
      this;
    return cloneDeep({
      id,
      name,
      type,
      layer,
      data,
      linkChild,
      linkParent: Array.from(linkParent),
      linkRely,
    });
  }
  /** 扁平化link数据 */
  flatLinkObj(obj: Record<string, string | string[]>): Set<string> {
    const ids = new Set<string>();
    for (const key in obj) {
      const value = obj[key];
      if (Array.isArray(value)) {
        for (const id of value) {
          ids.add(id);
        }
      } else {
        ids.add(value);
      }
    }
    return ids;
  }
  /** 扩展Render函数功能 */
  private effectRender() {
    const render = this.render;
    return (this.render = () => {
      if (!this.state.show) return;
      this.dataSnapshot = cloneDeep(this.data);
      return render.call(this);
    });
  }
  /** 扩展CheckSelect函数功能 */
  private effectCheckSelect() {
    const checkSelect = this.checkSelect;
    this.checkSelect = (point: Vec): boolean => {
      if (!this.state.show) return false;
      return checkSelect.call(this, point);
    };
  }
  /** 代理data */
  private proxyData(data: CellData) {
    const { id, name } = this;
    const { cmd } = this.control;

    return new Proxy(data, {
      set: (target, prop: string, value) => {
        if (this.created)
          cmd.collectEdit(
            this,
            Cell.FillCellStore({ id, name, data: { [prop]: value } }),
          );
        target[prop] = value;
        return true;
      },
    });
  }
}

import { ControlModule } from '../control-module';
import { CellStore, Cell } from '../../model';
import { cloneDeep } from 'lodash-es';
import { CmdCache, EditCmd, CreateCmd, DeleteCmd, Cmd } from './cmd';

/**
 * 命令管理
 */
export class CmdControl extends ControlModule {
  /** 命令锁 */
  private _lock = false;
  /** 最大命令长度 */
  private maxCmdsLength = 50;
  /** 撤销缓存 */
  private undoCmds: CmdCache[] = [];
  /** 反撤销缓存 */
  private redoCmds: CmdCache[] = [];
  /** 命令列表 */
  private cmdCache: CmdCache = { undoCmds: [], redoCmds: [] };

  get active() {
    return !this._lock && this.control.dispatch.ready;
  }

  set lock(value: boolean) {
    this._lock = value;
  }

  get lock(): boolean {
    return this._lock;
  }

  /** 收集命令结束时调用 */
  collectEnd() {
    if (!this.active) return;
    const { undoCmds, redoCmds } = this.cmdCache;
    if (undoCmds.length === 0 && redoCmds.length === 0) return;
    this.composeCmds(undoCmds);

    this.undoCmds.push({
      undoCmds: this.composeCmds(undoCmds),
      redoCmds: this.composeCmds(redoCmds),
    });

    if (this.undoCmds.length > this.maxCmdsLength) {
      this.undoCmds.splice(0, this.maxCmdsLength);
    }

    this.redoCmds = [];
    this.cmdCache = { undoCmds: [], redoCmds: [] };
    this.updateCmdBtn();
  }
  /**
   * 收集编辑cell数据命令
   *
   * @param cell 编辑相关的cell
   * @param store 要编辑的数据
   */
  collectEdit(cell: Cell, store: CellStore) {
    const { body } = this.control;
    if (!this.active) return;

    this.cmdCache.redoCmds.push(new EditCmd(this.filterStore(cell, store)));

    this.cmdCache.undoCmds.unshift(new EditCmd(store));
  }
  /**
   * 收集创建cell数据命令
   *
   * @param cell 创建相关的cell
   */
  collectCreate(cell: Cell) {
    const { body } = this.control;
    if (!this.active) return;

    this.cmdCache.redoCmds.push(new CreateCmd(cell.getStore()));

    this.cmdCache.undoCmds.unshift(new DeleteCmd(cell.id));
  }
  /**
   * 收集删除cell数据命令
   *
   * @param cell 删除相关的cell
   */
  collectDelete(cell: Cell) {
    const { body } = this.control;
    if (!this.active) return;

    this.cmdCache.redoCmds.push(new DeleteCmd(cell.id));

    this.cmdCache.undoCmds.unshift(new CreateCmd(cell.getStore()));
  }
  /** 撤销 */
  undo() {
    if (!this.active) return;
    const cmdCache = this.undoCmds.pop();
    if (!cmdCache) return;
    this._lock = true;
    const { body } = this.control;
    const undoCmds = cmdCache.undoCmds;

    for (let i = undoCmds.length - 1; i >= 0; --i) {
      undoCmds[i].do(body);
    }
    this.redoCmds.push(cmdCache);
    body.render();
    this._lock = false;
    this.updateCmdBtn();
  }
  /** 恢复 */
  redo() {
    if (!this.active) return;
    const cmdCache = this.redoCmds.pop();
    if (!cmdCache) return;
    this._lock = true;
    const { body } = this.control;
    const redoCmds = cmdCache.redoCmds;

    for (let i = 0; i < redoCmds.length; ++i) {
      redoCmds[i].do(body);
    }
    this.undoCmds.push(cmdCache);
    body.render();
    this._lock = false;
    this.updateCmdBtn();
  }
  /** 命令状态变化时抛出事件 */
  private updateCmdBtn = () => {
    this.control.eventBus.emit('cmd', {
      undo: this.undoCmds.length,
      redo: this.redoCmds.length,
    });
  };
  /**
   * 合并cell数据
   *
   * @param to 合并后的数据
   * @param from 要合并的数据
   */
  private mergeStore(to: CellStore, from: CellStore) {
    const keys = ['data', 'linkRely', 'linkChild'];
    // for (const key of keys) {
    //   if (from[key]) {
    //     to[key] = to[key] ?? {}
    //     Object.keys(from[key]).forEach((it) => (to[key][it] = cloneDeep(from[key][it])))
    //   }
    // }

    if (to.linkParent) to.linkParent = cloneDeep(from.linkParent);
  }
  /**
   * 过滤cell数据
   *
   * @param cell 要过滤的cell来源
   * @param store 过滤的数据样例
   */
  private filterStore(cell: Cell, store: CellStore): CellStore {
    const cellStore: CellStore = Cell.FillCellStore({
      id: cell.id,
      name: cell.name,
      linkParent: store.linkParent,
    });
    Object.keys(store.data).forEach(
      key => (cellStore.data[key] = cloneDeep(cell.data[key])),
    );
    Object.keys(store.linkChild).forEach(
      key => (cellStore.linkChild[key] = cloneDeep(cell.linkChild[key])),
    );
    Object.keys(store.linkRely).forEach(
      key => (cellStore.linkRely[key] = cloneDeep(cell.linkRely[key])),
    );

    return cellStore;
  }
  /** 合并命令 */
  private composeCmds(cmds: Cmd[]): Cmd[] {
    const composed: Map<string, Cmd> = new Map();

    for (let i = 0; i < cmds.length; ++i) {
      const cmd = cmds[i];
      const composedCmd = composed.get(cmd.id);
      if (!composedCmd || cmd.type === 'delete') {
        composed.set(cmd.id, cmd);
        continue;
      }

      if (composedCmd.type === 'create' && cmd.type === 'edit') {
        this.mergeStore(
          (composedCmd as CreateCmd).store,
          (cmd as EditCmd).store,
        );
        continue;
      }

      if (composedCmd.type === 'edit' && cmd.type === 'edit') {
        this.mergeStore((composedCmd as EditCmd).store, (cmd as EditCmd).store);
        continue;
      }

      if (composedCmd.type === 'delete' && cmd.type === 'create') {
        composed.set(cmd.id, cmd);
        continue;
      }
    }

    return Array.from(composed.values());
  }
}

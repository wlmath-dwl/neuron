import { ControlModule } from '../control-module';
import { Cell, CPoint } from '../../model';
import { Vec } from '../../view';

export class Motion extends ControlModule {
  private posCache: Map<string, Vec> = new Map();
  private dragTrace: Set<string> = new Set();

  dragClear() {
    this.dragTrace.clear();
    this.posCache.clear();
  }

  drag(
    param: { cell: Cell; pos?: Vec; offset?: boolean; from?: Cell },
    draging?: boolean,
  ) {
    const { body } = this.control;
    const { dragTrace, posCache } = this;
    const { cell, pos, offset, from } = param;
    const { linkParent, linkChild } = cell;

    if (!draging) dragTrace.clear();

    if (dragTrace.has(cell.id)) return;
    dragTrace.add(cell.id);

    // 更新自身
    if (cell instanceof CPoint && pos) {
      if (!posCache.get(cell.id)) posCache.set(cell.id, cell.getPos());
      const startPos = posCache.get(cell.id);
      if (startPos) Object.assign(cell.data, offset ? startPos.add(pos) : pos);
    }

    cell.update(from);

    // 更新父元素
    for (const it of linkParent) {
      const parentCell = body.getCell(it);
      if (!parentCell) continue;
      this.drag({ cell: parentCell, from: cell }, true);
    }

    // 更新子元素
    const childs = cell.flatLinkObj(linkChild);
    for (const it of childs) {
      const childCell = body.getCell(it);
      if (!childCell) continue;
      this.drag({ cell: childCell, pos, offset, from: cell }, true);
    }
  }
}

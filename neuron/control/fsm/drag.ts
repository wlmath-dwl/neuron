import { Fsm } from './index';
import { Vec } from '../../view';
import { Cell } from '../../model';

export class DragFsm extends Fsm {
  private dragPoint?: Vec;
  private dragX?: number;
  private dragY?: number;
  private dragVec?: Vec;
  private selectCell?: Cell;
  private touchDown = false;

  clearCellState() {
    const cells = this.control.body.getCells();
    for (const cell of cells) {
      cell.clearState();
    }
    this.selectCell = undefined;
  }
  dragStart(screenVecs: Vec[], mathVecs: Vec[]) {
    const { body } = this.control;
    const { transform } = this.view;
    const [p1] = screenVecs;
    const [v1] = mathVecs;
    this.touchDown = true;
    this.dragVec = v1;

    this.clearCellState();

    if (screenVecs.length === 1) {
      const selectCell = body.getSelectCell(v1);
      this.control.eventBus.emit('select', selectCell);

      if (selectCell) {
        selectCell.state.select = true;
        selectCell.click(p1);
        this.selectCell = selectCell;
      } else {
        const { ox, oy } = transform;
        this.dragX = ox;
        this.dragY = oy;
        this.dragPoint = p1;
        this.selectCell = undefined;
      }
    }

    body.render();
  }
  drag(screenVecs: Vec[], mathVecs: Vec[]) {
    const [p1] = screenVecs;
    const [v1] = mathVecs;
    const { body, dispatch, motion } = this.control;
    const { transform } = this.view;
    const { hover, viewDrag } = dispatch.config;

    if (hover) {
      const cells = body.getCells();
      let cursor = 'auto';
      for (const cell of cells) {
        if (cell.checkSelect(v1)) {
          cell.state.hover = true;
          cursor = 'pointer';
        } else {
          cell.state.hover = false;
        }
      }
      document.body.style.cursor = cursor;
      body.render();
    }

    if (!this.touchDown) return;

    if (screenVecs.length === 1) {
      const { dragPoint, dragX, dragY, dragVec, selectCell } = this;

      if (selectCell) {
        motion.drag({
          cell: selectCell,
          pos: v1.del(dragVec ?? Vec.zero()),
          offset: true,
        });
      } else {
        if (viewDrag) {
          transform.ox = (dragX ?? 0) + p1.x - (dragPoint?.x ?? 0);
          transform.oy = (dragY ?? 0) + p1.y - (dragPoint?.y ?? 0);
        }
      }
    }

    body.render();
  }
  dragEnd(screenVecs: Vec[], mathVecs: Vec[]) {
    if (!this.touchDown) return;
    const { body, cmd, motion } = this.control;

    if (screenVecs.length === 1) {
      this.drag(screenVecs, mathVecs);
      this.dragPoint = undefined;
      this.dragX = undefined;
      this.dragY = undefined;
    }

    motion.dragClear();
    cmd.collectEnd();

    this.dragVec = undefined;
    this.touchDown = false;
    body.render();
  }
  zoom(screenVecs: Vec[], mathVecs: Vec[], zoom: boolean) {
    const { transform } = this.view;
    const { body } = this.control;
    const [p1] = screenVecs;
    const centerVector = transform.t(p1.x, p1.y);
    const centerPoint = { ...p1 };

    transform.density *= 1 + (zoom ? 0.05 : -0.05);
    const correctPoint = transform.c(centerVector.x, centerVector.y);
    transform.ox -= correctPoint.x - centerPoint.x;
    transform.oy -= correctPoint.y - centerPoint.y;

    body.render();
  }
}

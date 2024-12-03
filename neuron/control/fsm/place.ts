import { Fsm } from './fsm';
import { Vec } from '../../view';

export class PlaceFsm extends Fsm {
  private cellName: string;

  constructor({ cellName }: { cellName: string }) {
    super();
    this.cellName = cellName;
  }

  dragStart(screenVecs: Vec[], mathVecs: Vec[]) {
    const { body, dispatch, cmd } = this.control;
    const { cellName } = this;
    const [v1] = mathVecs;
    body.createCell({ name: cellName, data: { ...v1 } });
    body.render();
    cmd.collectEnd();
    dispatch.changeFsm('DragFsm');
  }
}

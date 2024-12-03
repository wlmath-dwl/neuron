import { CellParam, Cell } from './index';
import { Vec, NS } from '../view';
import { merge } from 'lodash-es';

export interface CPointData {
  x: NS;
  y: NS;
  angle: number;
}

export type CPointParam = CellParam & {
  data?: CPointData & { angle?: number };
};

export abstract class CPoint extends Cell {
  declare data: { x: NS; y: NS; angle: number };
  posCache?: Vec;

  constructor(param: CPointParam) {
    super(merge({ data: { x: 0, y: 0, angle: 45 } }, param));
  }
  setPos(pos: Vec, draging = false) {
    const { motion, body } = this.control;
    if (!draging) motion.dragClear();
    motion.drag({ cell: this, pos, offset: false });
    if (!draging) motion.dragClear();
    body.render();
  }
  setPosImmediate(pos: Vec) {
    Object.assign(this.data, pos);
  }
  getPos(): Vec {
    const { transform } = this.view;
    const { x, y } = this.data;

    return new Vec(
      typeof x === 'string' ? transform.tx(Number(x)) : x,
      typeof y === 'string' ? transform.ty(Number(y)) : y,
    );
  }
}

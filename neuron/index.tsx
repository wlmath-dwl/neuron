import { View } from './view';
import { Control } from './control';

export * from './view';
export * from './model';
export * from './control';

export interface NeuronParam {
  dom: HTMLElement;
}

export class Neuron {
  control: Control;
  view: View;

  constructor(param: NeuronParam) {
    this.view = new View(param);
    this.control = new Control({ ...param, view: this.view });
  }
  destroy() {
    this.view.destroy();
    this.control.destroy();
  }
}

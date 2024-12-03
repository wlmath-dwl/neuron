import { NeuronParam } from '../index';
import { View } from '../view';
import { Control } from './control';

export interface ControlParam extends NeuronParam {
  view: View;
}

export interface ControlModuleParam extends ControlParam {
  control: Control;
}

export class ControlModule {
  view: View;
  dom: HTMLElement;
  control: Control;

  constructor({ dom, view, control }: ControlModuleParam) {
    this.dom = dom;
    this.view = view;
    this.control = control;
  }
}

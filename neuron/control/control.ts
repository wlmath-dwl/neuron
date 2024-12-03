import { NeuronParam } from '../index';
import { View } from '../view';
import { Dispatch } from './fsm';
import { Body } from './body';
import { CmdControl } from './cmd';
import { Motion } from './motion';
import { EventBus } from './event';

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

export class Control {
  dispatch: Dispatch;
  body: Body;
  eventBus: EventBus;
  cmd: CmdControl;
  motion: Motion;

  constructor(param: ControlParam) {
    this.dispatch = new Dispatch({ ...param, control: this });
    this.body = new Body({ ...param, control: this });
    this.eventBus = new EventBus();
    this.cmd = new CmdControl({ ...param, control: this });
    this.motion = new Motion({ ...param, control: this });
  }
  destroy() {
    this.dispatch.destory();
  }
}

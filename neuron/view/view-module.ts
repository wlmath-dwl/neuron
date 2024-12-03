import { View } from './index'

export interface ViewModuleParam {
  dom: HTMLElement
  view: View
}

export class ViewModule {
  dom: HTMLElement
  view: View

  constructor(param: ViewModuleParam) {
    this.dom = param.dom
    this.view = param.view
  }
}

import { Paint } from './paint'
import { Transform } from './transform'
import { Collision } from './collision'
import { EditorParam } from '../index'

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

export class View {
  paint: Paint
  transform: Transform
  collision: Collision

  constructor(param: EditorParam) {
    const transform = new Transform({ ...param, view: this })
    const paint = new Paint({ ...param, view: this })
    const collision = new Collision({ ...param, view: this })

    this.paint = paint
    this.transform = transform
    this.collision = collision
  }
  destroy() {
    // to do
  }
}

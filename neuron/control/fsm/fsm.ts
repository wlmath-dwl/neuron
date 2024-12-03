import { View, Vec } from '../../view'
import { Control } from '../../control'

export abstract class Fsm {
  control!: Control
  view!: View
  hover = false

  dragStart(screenVecs: Vec[], mathVecs: Vec[]) {
    // to override
  }
  drag(screenVecs: Vec[], mathVecs: Vec[]) {
    // to override
  }
  dragEnd(screenVecs: Vec[], mathVecs: Vec[]) {
    // to override
  }
  zoom(screenVecs: Vec[], mathVecs: Vec[], zoom: boolean) {
    // to override
  }
}

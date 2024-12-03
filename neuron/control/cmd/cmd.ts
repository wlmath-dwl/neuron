import { CellStore } from '../../model'
import { Body } from '../body'
import { merge } from 'lodash-es'

export type CmdType = 'edit' | 'create' | 'delete'

export interface CmdCache {
  redoCmds: Cmd[]
  undoCmds: Cmd[]
}

export interface CmdParam {
  body: Body
  store: CellStore
}

/**
 * 命令基类
 */
export abstract class Cmd {
  /** 命令类型 */
  type!: CmdType
  /** 命令id, 来源cell id */
  id!: string
  /** 命令执行 */
  abstract do(body: Body): void
}

/**
 * 编辑Cell命令
 */
export class EditCmd extends Cmd {
  store: CellStore

  constructor(store: CellStore) {
    super()
    this.id = store.id
    this.type = 'edit'
    this.store = store
  }
  do(body: Body): void {
    const { store } = this
    const cell = body.getCell(store.id)
    if (!cell) return
    merge(cell, store)
  }
}

/**
 * 创建Cell命令
 */
export class CreateCmd extends Cmd {
  store: CellStore

  constructor(store: CellStore) {
    super()
    this.id = store.id
    this.type = 'create'
    this.store = store
  }
  do(body: Body): void {
    const { store } = this
    body.createCell(store)
  }
}

/**
 * 删除Cell命令
 */
export class DeleteCmd extends Cmd {
  constructor(cellId: string) {
    super()
    this.id = cellId
    this.type = 'delete'
  }
  do(body: Body): void {
    body.removeCell(this.id)
  }
}

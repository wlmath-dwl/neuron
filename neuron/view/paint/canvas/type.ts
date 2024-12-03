export interface PointCanvas {
  x: number
  y: number
}

export interface StyleLine {
  color?: string
  wide?: number
  opacity?: number
}

export interface StyleShape {
  color?: string
  borderColor?: string
  wide?: number
  opacity?: number
}

export type TxtStyle = {
  color: string
  bold?: boolean
  size: number
  alignX: CanvasTextAlign
  alignY: CanvasTextBaseline
}

export type PaintLine = {
  start: PointCanvas
  end: PointCanvas
} & StyleLine

export type PaintLines = {
  points: {
    x: number
    y: number
    s?: boolean
  }[]
} & StyleLine

export type PaintArc = {
  start: number
  end: number
  r: number
  center: PointCanvas
} & StyleLine

export type PaintCircle = {
  r: number
  center: PointCanvas
} & StyleShape

export type PaintPolygon = {
  points: PointCanvas[]
} & StyleShape

export type PaintRect = {
  x: number
  y: number
  w: number
  h: number
} & StyleShape

export type PaintTxt = {
  context: {
    txt: string
    pos: PointCanvas
  }[]
} & TxtStyle

export interface PathArc {
  type: 'arc'
  rate: number
  clockwise: boolean
}

export type PathData = {
  points: PointCanvas[]
  paths?: Record<number, PathArc>
} & StyleShape

export interface Rotate {
  radian: number
  axis: PointCanvas
}

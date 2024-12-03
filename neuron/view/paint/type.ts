import { StyleLine, StyleShape, TxtStyle } from './canvas/type';

export type NS = number | string;

export type Point = {
  x: NS;
  y: NS;
};

export type Lines = (Point & { s?: boolean })[];

export type ShapeLine = {
  start: Point;
  end: Point;
} & StyleLine;

export type ShapeLines = {
  points: {
    x: NS;
    y: NS;
    s?: boolean;
  }[];
} & StyleLine;

export type ShapeArc = {
  start: NS;
  end: NS;
  r: NS;
  center: Point;
} & StyleShape;

export type ShapeCircle = {
  r: NS;
  center: Point;
} & StyleShape;

export type ShapePolygon = {
  points: Point[];
} & StyleShape;

export type ShapeRect = {
  x: NS;
  y: NS;
  w: NS;
  h: NS;
} & StyleShape;

export type ShapeTxtContent = {
  txt: string;
  pos: Point;
};

export type ShapeTxt = {
  context: ShapeTxtContent[];
} & TxtStyle;

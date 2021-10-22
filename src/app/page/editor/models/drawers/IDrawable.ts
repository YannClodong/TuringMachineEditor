import DrawingUtils from "./DrawingUtils";

export enum DrawableType {
  "TURRING_MACHINE",
  "TURRING_STATE",
  "TURRING_OPERATION"
}

export default interface IDrawable {
  getType(): DrawableType;
  isSelectable(): boolean;
  isOver(x: number, y: number, rx: number, ry: number): boolean;
  onDrag(x: number, y: number): void;
  onDropRight(x: number, y: number, over?: IDrawable): void;
  onDragRight(x: number, y: number): void;
  onDrop(x: number, y: number, over?: IDrawable): void;
  onMouseDown(x: number, y: number, rx: number, ry: number): void;
  draw(ctx: CanvasRenderingContext2D, utils: DrawingUtils, selected: boolean): void;
  children(): IDrawable[];
  onLoseFocus(): void;
  onSupprButtonPressed(): void;
}

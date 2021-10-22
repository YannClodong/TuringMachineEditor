import IDrawable, {DrawableType} from "./IDrawable";
import Transition from "../Transition";
import TurringStateDrawer from "./TurringStateDrawer";
import TurringMachineDrawer from "./TurringMachineDrawer";
import DrawingUtils, {doubleSensDelta} from "./DrawingUtils";
import Vector from "../utils/vector";
import TurringAction from "../TurringAction";
import {max} from "rxjs/operators";

export default class TurringTransitionDrawer implements IDrawable {

  private start: TurringStateDrawer;
  private end: TurringStateDrawer;
  public from: number;
  public to: number;
  private hitbox?: { pos: Vector, size: Vector }
  private selected = false;


  constructor(private transition: Transition, public machineDrawer: TurringMachineDrawer, start?: TurringStateDrawer, end?: TurringStateDrawer) {
    if (!start)
      start = machineDrawer.getState(transition.start);

    if (!end)
      end = machineDrawer.getState(transition.end);

    if (!start || !end)
      throw "State drawer not found";

    this.start = start;
    this.end = end;
    this.from = start.getStateName();
    this.to = end.getStateName();
  }



  children(): IDrawable[] {
    return [];
  }

  draw(ctx: CanvasRenderingContext2D, utils: DrawingUtils): void {

    ctx.font = "20px sans-serif";
    if(this.selected) {

      ctx.strokeStyle = ctx.fillStyle = "#d35400"
    } else {
      ctx.strokeStyle = ctx.fillStyle = "#2c3e50"
    }

    let doubleSens = false;
    if(this.start != this.end && this.end.connectedTo(this.start.getStateName()))
      doubleSens = true;

    utils.drawArrow(this.start, this.end, this.transition.direction, doubleSens ? "RIGHT" : "CENTER");
    ctx.beginPath();
    let hitbox: { pos: Vector, size: Vector }

    const text = this.transition.action.serialize();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l != "");
    const maxWidth = lines.map(l => ctx.measureText(l).width).reduce((pv, cv) => pv > cv ? pv : cv, 0);
    const size = new Vector(maxWidth, lines.length * 20);
    const measure = ctx.measureText(text);

    if(this.transition.direction) {
      const pos = utils.getPositionFromVector(this.start.getPosition().add(this.transition.direction.scalar(105)));


      if(Math.abs(this.transition.direction.x) > Math.abs(this.transition.direction.y)) {
        ctx.textBaseline = "middle"
        if (this.transition.direction.x > 0) {
          ctx.textAlign = "start";
          hitbox = { pos: new Vector(pos.x + size.x / 2, pos.y), size: new Vector(size.x, size.y)}
        }
        else {
          hitbox = { pos: new Vector(pos.x - size.x / 2, pos.y), size: new Vector(size.x, size.y)}
          ctx.textAlign = "end";
        }
      }
      else {
        ctx.textAlign = "center";
        if(this.transition.direction.y > 0) {
          hitbox = { pos: new Vector(pos.x, pos.y + size.y / 2), size: new Vector(size.x, size.y)}
          ctx.textBaseline = "top";
        } else {
          hitbox = { pos: new Vector(pos.x, pos.y - size.y / 2), size: new Vector(size.x, size.y)}
          ctx.textBaseline = "bottom";
        }
      }
      utils.drawMultilineText(text, pos.x, pos.y);
      //ctx.fillText(text, pos.x, pos.y);
    } else {
      const dir = this.end.getPosition().sub(this.start.getPosition());
      let pos = utils.getPositionFromVector(dir.scalar(1/ 2).add(dir.perpendicular().normalize().scalar(-5)).add(this.start.getPosition()));

      if(this.end.connectedTo(this.start.getStateName())) {
        pos = pos.add(dir.perpendicular().normalize().scalar(-doubleSensDelta))
      }

      if (dir.y > 0) {
        ctx.textAlign = "left";
      }
      else {
        ctx.textAlign = "right";
      }

      if(dir.x < 0)
        ctx.textBaseline = "top"
      else
        ctx.textBaseline = "bottom"


      const xdelta = ctx.textAlign == "right" ? -size.x / 2 : (ctx.textAlign == "left" ? size.x / 2 : 0);
      const ydelta = ctx.textBaseline == "top" ? size.y / 2 : (ctx.textBaseline == "bottom" ? -size.y / 2 : 0);


      hitbox = { pos: pos.add(new Vector(xdelta, ydelta)), size: new Vector(size.x, size.y) };
      utils.drawMultilineText(text, pos.x, pos.y);
      //ctx.fillText(text, pos.x, pos.y);
    }
    ctx.stroke();

    this.hitbox = hitbox;
  }

  isOver(x: number, y: number, rx: number, ry: number): boolean {
    if(!this.hitbox) return false;
    const result = (Math.abs(rx - this.hitbox.pos.x) < this.hitbox.size.x / 2
      && Math.abs(ry - this.hitbox.pos.y) < this.hitbox.size.y / 2);
    return result;
  }

  onDrag(x: number, y: number): void {
    if(!this.transition.direction) return;
    const sp = this.start.getPosition();
    const mp = new Vector(x, y);

    this.transition.direction = mp.sub(sp).normalize();
  }

  onDragRight(x: number, y: number): void {
  }

  onDrop(x: number, y: number): void {
  }

  getType(): DrawableType {
    return DrawableType.TURRING_OPERATION;
  }

  onMouseDown(x: number, y: number): void {
    this.selected = true;
  }

  onDropRight(x: number, y: number): void {
  }

  onLoseFocus(): void {
    this.selected = false;
  }

  onSupprButtonPressed(): void {
    this.start.removeTransition(this.to);
  }

  isSelectable(): boolean {
    return true;
  }

  setOperation(text: string) {
    const action = TurringAction.create(text, this.machineDrawer.machine);
    this.transition.action = action;
  }

  getOperationString() {
    return this.transition.action.serialize();
  }
}

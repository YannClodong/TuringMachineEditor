import IDrawable, {DrawableType} from "./IDrawable";
import TurringMachine from "../TurringMachine";
import TurringStateDrawer from "./TurringStateDrawer";
import DrawingUtils from "./DrawingUtils";
import Vector from "../utils/vector";

export default class TurringMachineDrawer implements IDrawable {

  private nodeDrawer: TurringStateDrawer[] = [];

  constructor(public machine: TurringMachine) {
    this.nodeDrawer = this.machine.states.map(s => new TurringStateDrawer(s, this));
    this.nodeDrawer.forEach(n => n.extractTransitions());
  }

  onSupprButtonPressed(): void {
        throw new Error("Method not implemented.");
    }


  isOver(x: number, y: number): boolean {
    return false;
  }

  children(): IDrawable[] {
    return this.nodeDrawer;
  }

  draw(ctx: CanvasRenderingContext2D, utils: DrawingUtils): void {
  }

  onDrag(x: number, y: number): void {
  }

  onDragRight(x: number, y: number): void {
  }

  public createState(loc: Vector) {
    const state = this.machine.addnode(loc.x, loc.y);
    const drawer = new TurringStateDrawer(state, this);
    this.nodeDrawer.push(drawer);
    return drawer;
  }
  public removeState(stateName: number) {
    this.machine.removeState(stateName);
    this.nodeDrawer.forEach(n => n.removeTransition(stateName));
    this.nodeDrawer = this.nodeDrawer.filter(n => n.getStateName() != stateName);
  }


  public getState(stateName: number) {
    return this.nodeDrawer.find(d => d.getStateName() === stateName);
  }

  onDrop(x: number, y: number): void {
  }

  getType(): DrawableType {
    return DrawableType.TURRING_MACHINE;
  }

  onMouseDown(x: number, y: number): void {
  }

  onDropRight(x: number, y: number): void {
  }

  onLoseFocus(): void {
  }

  isSelectable(): boolean {
    return false;
  }
}

import IDrawable, {DrawableType} from "./IDrawable";
import State from "../State";
import DrawingUtils, {stateRadius} from "./DrawingUtils";
import TurringTransitionDrawer from "./TurringTransitionDrawer";
import Vector from "../utils/vector";
import TurringMachineDrawer from "./TurringMachineDrawer";
import TurringOperation from "../TurringAction";
import AtomicTurringOperation from "../TurringAction/AtomicTurringOperation";


export default class TurringStateDrawer implements IDrawable {
  private edgesDrawer: TurringTransitionDrawer[] = []
  private drawingPath = false;
  private end: Vector = new Vector(0, 0)

  constructor(private state: State, private machineDrawer: TurringMachineDrawer) {
  }

  extractTransitions() {
    this.edgesDrawer = this.state.transitions.map(t => new TurringTransitionDrawer(t, this.machineDrawer, this));
  }



  draw(ctx: CanvasRenderingContext2D, utils: DrawingUtils, selected: boolean): void {
    let color = "#2c3e50"
    if(this.state.final)
      color = "#27ae60";
    if(selected)
      color = "#d35400";
    const border = color;
    let fill = "#ecf0f1";
    if(this.machineDrawer.machine.isNodeActive(this.getStateName()))
      fill = "#3498db";

    const loc = utils.getPosition(this.state.x, this.state.y);
    const rd = utils.getScale(stateRadius);
    ctx.lineWidth = utils.getScale(5);
    ctx.font = Math.floor(utils.getScale(48)) + 'px sans-serif';
    ctx.strokeStyle = border;
    ctx.fillStyle = fill
    ctx.beginPath();
    ctx.ellipse(loc.x, loc.y, rd, rd, 0, 0, 360);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = border;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(this.state.nodeName.toString(), loc.x, loc.y + 5);

    if(this.drawingPath) {
      utils.drawArrowFree(this, this.end)
      this.drawingPath = false;
    }
  }

  isOver(x: number, y: number): boolean {
    return Math.pow(x - this.state.x, 2) + Math.pow(y - this.state.y, 2) < Math.pow(stateRadius, 2);
  }

  children(): IDrawable[] {
    return this.edgesDrawer;
  }

  onDrag(x: number, y: number): void {
    this.state.y = y;
    this.state.x = x;
  }

  onDragRight(x: number, y: number): void {
    this.drawingPath = true;
    this.end = new Vector(x, y);
  }

  onDrop(x: number, y: number, over?: IDrawable): void {

  }

  getPosition() {
    return new Vector(this.state.x, this.state.y);
  }

  getStateName() {
    return this.state.nodeName;
  }

  getType(): DrawableType {
    return DrawableType.TURRING_STATE;
  }

  removeTransition(dest: number) {
    this.edgesDrawer = this.edgesDrawer.filter(e => e.to != dest);
    if(!this.state.transitionExistTo(dest)) return;
    this.state.removeTransition(dest);
  }

  createTransition(dest: TurringStateDrawer, direction?: Vector) {
    if(this.state.transitionExistTo(dest.getStateName())) return;

    const tr = this.state.addTransition(
      dest.getStateName(),
      direction,
      new TurringOperation([ new AtomicTurringOperation(this.machineDrawer.machine.bands.map(m => "0"), this.machineDrawer.machine.bands.map(m => "0"), this.machineDrawer.machine.bands.map(m => "LEFT"), this.machineDrawer.machine)])
    );
    const drawer = new TurringTransitionDrawer(tr, this.machineDrawer);
    this.edgesDrawer.push(drawer);
    return drawer;
  }

  onMouseDown(x: number, y: number, rx: number, ry: number): void {
    console.log("State pressed !")
  }

  onDropRight(x: number, y: number, over?: IDrawable): void {
    this.drawingPath = false;
    if(over && over.getType() == DrawableType.TURRING_STATE) {
      const target = over as TurringStateDrawer;
      if(target.getStateName() === this.getStateName()) {
        const pos = new Vector(this.state.x, this.state.y);
        const direction = new Vector(x, y).sub(pos);
        this.createTransition(over as TurringStateDrawer, direction.normalize());
      } else {
        this.createTransition(over as TurringStateDrawer);
      }
    } else if(!over) {
      const drawer = this.machineDrawer.createState(new Vector(x, y))
      this.createTransition(drawer);
    }
  }

  onLoseFocus(): void {
  }

  onSupprButtonPressed(): void {
    if(this.getStateName() == 0) return;

    this.machineDrawer.removeState(this.getStateName());
  }

  isSelectable(): boolean {
    return true;
  }

  connectedTo(state: number) {
    return this.state.transitionExistTo(state);
  }

  setActive() {
    this.machineDrawer.machine.setStateActive(this.getStateName());
  }

  isFinal() {
    return this.state.final;
  }

  setFinal(value: boolean) {
    this.state.final = value;
  }

  toggleFinal() {
    this.state.final = !this.state.final;
  }
}

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
    let color = "#2c3e50"     // Normal state
    if(this.state.final)
      color = "#27ae60";      // Final State
    if(selected)
      color = "#d35400";      // Selected state

    const border = color;
    let fill = "#ecf0f1";     // Normal state
    if(this.machineDrawer.machine.isNodeActive(this.getStateName()))
      fill = "#3498db";       // Active state

    // Compute position in screen space
    const loc = utils.getPosition(this.state.x, this.state.y);

    // Compute scale in screen space
    const rd = utils.getScale(stateRadius);

    // Styling the node
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

    // Labeling the node
    ctx.fillText(this.state.nodeName.toString(), loc.x, loc.y + 5);

    if(this.drawingPath) {

      // Draw the currently creating arrow
      utils.drawArrowFree(this, this.end)
      this.drawingPath = false;
    }
  }

  isOver(x: number, y: number): boolean {
    return Math.pow(x - this.state.x, 2) + Math.pow(y - this.state.y, 2) < Math.pow(stateRadius, 2);
  }

  children(): IDrawable[] {
    // Return the children
    return this.edgesDrawer;
  }

  onDrag(x: number, y: number): void {
    // Move the node
    this.state.y = y;
    this.state.x = x;
  }

  onDragRight(x: number, y: number): void {
    // Start creating a transition
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
    // Create transition between this state and the state whom are bellow the cursor on dropping

    // Disabling transition edition
    this.drawingPath = false;

    // Check if there is something bellow the cursor
    if(over && over.getType() == DrawableType.TURRING_STATE) {
      const target = over as TurringStateDrawer;

      // Check if we want to create an in-place transition
      if(target.getStateName() === this.getStateName()) {
        const pos = new Vector(this.state.x, this.state.y);
        const direction = new Vector(x, y).sub(pos);

        // Create the transition
        this.createTransition(over as TurringStateDrawer, direction.normalize());
      } else {

        // Create the straight transition
        this.createTransition(over as TurringStateDrawer);
      }
    } else if(!over) {
      // If there is nothing bellow we create a new node
      const drawer = this.machineDrawer.createState(new Vector(x, y))

      // And we link it with the starting node
      this.createTransition(drawer);
    }
  }

  onLoseFocus(): void {
  }

  onSupprButtonPressed(): void {
    // If this is the initial node we can't remove it
    if(this.getStateName() == 0) return;

    // Otherwise, remove the node
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

  toggleFinal() {
    this.state.final = !this.state.final;
  }

  getSuccessMessage() {
    return this.state.successMessage
  }

  setSuccessMessage(value: string) {
    this.state.successMessage = value;
  }
}

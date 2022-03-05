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

    // Set color when selected or not
    if(this.selected) {
      ctx.strokeStyle = ctx.fillStyle = "#d35400"
    } else {
      ctx.strokeStyle = ctx.fillStyle = "#2c3e50"
    }

    // Create a variable representing if there is two arrow coming and going to another node
    let doubleSens = false;
    if(this.start != this.end && this.end.connectedTo(this.start.getStateName()))
      doubleSens = true;

    // Drawing the head of the arrow
    utils.drawArrow(this.start, this.end, this.transition.direction, doubleSens ? "RIGHT" : "CENTER");

    // Drawing corpse of the arrow
    ctx.beginPath();
    let hitbox: { pos: Vector, size: Vector }

    // Serializing transition condition/action into readable transition
    const text = this.transition.action.serialize();

    // Cleaning transition conditions/action
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l != "");

    // Retrieve the width of the longest line
    const maxWidth = lines
      .map(l => ctx.measureText(l).width)
      .reduce((pv, cv) => pv > cv ? pv : cv, 0);

    // Building the size of the text
    const size = new Vector(maxWidth, lines.length * 20);

    // Checking if there is a direction for the arrow (case of inplace loops)
    if(this.transition.direction) {
      const pos = utils.getPositionFromVector(this.start.getPosition().add(this.transition.direction.scalar(105)));


      // Automatic positionning of the text
      if(Math.abs(this.transition.direction.x) > Math.abs(this.transition.direction.y)) {

        // The Arrow is vertical so vertical text origin must be on the middle
        ctx.textBaseline = "middle"

        if (this.transition.direction.x > 0) {

          // This arrow is like:  ↗️or  ↘️
          // => the horizontal origin should be at the start of the text
          ctx.textAlign = "start";

          // And we compute the hitbox using the position of the text
          hitbox = { pos: new Vector(pos.x + size.x / 2, pos.y), size: new Vector(size.x, size.y)}
        }
        else {

          // This arrow is: ↙️or  ↖️
          // => the horizontal origin should be at the end of the text
          ctx.textAlign = "end";

          // And we compute the hitbox using the position of the text
          hitbox = { pos: new Vector(pos.x - size.x / 2, pos.y), size: new Vector(size.x, size.y)}
        }
      }
      else {
        // The arrow is mainly horizontal
        // So the horizontal origin should be at the middle
        ctx.textAlign = "center";

        if(this.transition.direction.y > 0) {

          // The arrow is like this: ↙️or   ️↘️
          // => The text is bellow so the vertical origin should be at the top of the text
          ctx.textBaseline = "top";

          // Compute hitbox
          hitbox = { pos: new Vector(pos.x, pos.y + size.y / 2), size: new Vector(size.x, size.y)}
        } else {

          // The arrow is like this: ↖️or  ↗️
          // => The text is over the so the vertical origin is at the bottom of the text
          ctx.textBaseline = "bottom";

          // Compute hitbox
          hitbox = { pos: new Vector(pos.x, pos.y - size.y / 2), size: new Vector(size.x, size.y)}
        }
      }

      //Draw the text with the given parameters
      utils.drawMultilineText(text, pos.x, pos.y);
    } else {

      // Arrow is straight arrow

      // Direction of the arrow, endpoint less startpoint
      const dir = this.end.getPosition().sub(this.start.getPosition());
      const textWorldPosition = dir
        .scalar(1/ 2) // Get the half of the direction vector
        .add(dir
          .perpendicular() // Creating a margin between text and arrow
          .normalize()
          .scalar(-5))
        .add(this.start.getPosition()); // Add the start of the arrow to create a point

      let pos = utils.getPositionFromVector(textWorldPosition); // Convert to screen space

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

      // Computing hitbox
      hitbox = { pos: pos.add(new Vector(xdelta, ydelta)), size: new Vector(size.x, size.y) };

      // Draw text with given parameter
      utils.drawMultilineText(text, pos.x, pos.y);
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


  // Can make the inplace transition turn arround the node
  onDrag(x: number, y: number): void {
    // If this is not an in-place transition (= there is 2 different nodes linked on the transition)
    if(!this.transition.direction) return;

    const sp = this.start.getPosition();
    const mp = new Vector(x, y);

    // Updating the direction
    this.transition.direction = mp.sub(sp).normalize();
  }

  onDragRight(x: number, y: number): void {
    // Nothing to be done
  }

  onDrop(x: number, y: number): void {
  }

  getType(): DrawableType {
    return DrawableType.TURRING_OPERATION;
  }

  onMouseDown(x: number, y: number): void {
    // Select this arrow
    this.selected = true;
  }

  onDropRight(x: number, y: number): void {
  }

  onLoseFocus(): void {
    // Unselect
    this.selected = false;
  }

  onSupprButtonPressed(): void {
    // Remove transition
    this.start.removeTransition(this.to);
  }

  isSelectable(): boolean {
    return true;
  }

  setOperation(text: string) {
    // Edit conditions/actions in the transition
    const action = TurringAction.create(text, this.machineDrawer.machine);
    this.transition.action = action;
  }

  getOperationString() {
    // Get the condition/action text
    return this.transition.action.serialize();
  }
}

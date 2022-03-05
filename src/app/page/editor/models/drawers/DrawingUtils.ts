import Vector from "../utils/vector";
import TurringStateDrawer from "./TurringStateDrawer";

export const stateRadius = 30;
export const doubleSensDelta = stateRadius * 1 / 3;

export default class DrawingUtils {



  constructor(private ctx: CanvasRenderingContext2D, private offset: Vector) {
  }

  getScale(scale: number) {
    return scale;
  }

  getPositionFromVector(v: Vector) {
    return this.getPosition(v.x, v.y);
  }

  getPosition(x: number, y: number) {
    return new Vector(x, y).sub(this.offset);
  }

  getScreen2WorldPosition(x: number, y: number) {
    return new Vector(x, y).sub(this.offset);
  }

  getScreen2WorldPositionVector(v: Vector) {
    return this.getScreen2WorldPosition(v.x, v.y);
  }

  drawArrow(debutState: TurringStateDrawer, endState: TurringStateDrawer, direction?: Vector, relPos: "CENTER"|"LEFT"|"RIGHT" = "RIGHT") {
    const ctx = this.ctx;
    const loc = this.getPositionFromVector(debutState.getPosition());

    let final: { pt: Vector, direction: Vector };

    ctx.beginPath();
    if(debutState.getStateName() == endState.getStateName()) {

      // Draw round arrow
      if(!direction)
        direction = new Vector(0, 1);
      const p = direction.perpendicular().normalize().scalar(0.3);
      const v1 = direction.add(p).normalize();
      const v2 = direction.sub(p).normalize();
      const p1 = loc.add(v1.scalar(stateRadius))
      const p2 = loc.add(v2.scalar(stateRadius))

      const der1 = v1.scalar(100).add(p1);
      const der2 = v2.scalar(100).add(p2);
      final = { pt: p2, direction: v2.scalar(-1) }

      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(der1.x, der1.y, der2.x, der2.y, p2.x, p2.y);
    } else {

      // Draw straight arrow
      const end = this.getPositionFromVector(endState.getPosition());
      const v = end.sub(loc).normalize();
      const relV = relPos == "CENTER" ? new Vector(0, 0) : (relPos == "LEFT" ? v.perpendicular().scalar(doubleSensDelta) : v.perpendicular().scalar(-doubleSensDelta))
      const vs = v.scalar(stateRadius).add(relV).normalize();
      const ve = v.scalar(-stateRadius).add(relV).normalize();

      const startArrow = loc.add(vs.scalar(stateRadius));
      const endArrow = end.add(ve.scalar(stateRadius));

      ctx.moveTo(startArrow.x, startArrow.y);
      ctx.lineTo(endArrow.x, endArrow.y);
      final = { pt: endArrow, direction: v.normalize() };
    }
    ctx.stroke();

    // Draw the head of the arrow
    ctx.beginPath();
    ctx.moveTo(final.pt.x, final.pt.y);
    const baseArrow = final.pt.sub(final.direction.scalar(16));
    const c1 = baseArrow.add(final.direction.perpendicular().scalar(8));
    const c2 = baseArrow.add(final.direction.perpendicular().scalar(-8));
    ctx.lineTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.closePath();
    ctx.fill();
  }

  // Draw arrow between a node and a point
  drawArrowFree(debut: TurringStateDrawer, end: Vector) {
    const ctx = this.ctx;
    const loc = this.getPositionFromVector(debut.getPosition());
    let v = end.sub(loc);
    const dist = v.length();
    v = v.scalar(1 / dist); // Normalize

    let final: { pt: Vector, direction: Vector };

    ctx.beginPath();
    if(dist < stateRadius) {
      const p = v.perpendicular().normalize().scalar(0.3);
      const v1 = v.add(p).normalize();
      const v2 = v.sub(p).normalize();
      const p1 = loc.add(v1.scalar(stateRadius))
      const p2 = loc.add(v2.scalar(stateRadius))

      const der1 = v1.scalar(100).add(p1);
      const der2 = v2.scalar(100).add(p2);
      final = { pt: p2, direction: v2.scalar(-1) }

      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(der1.x, der1.y, der2.x, der2.y, p2.x, p2.y);
    } else {
      ctx.moveTo(loc.x + v.x * stateRadius, loc.y + v.y * stateRadius);
      ctx.lineTo(end.x - v.x * 16, end.y - v.y * 16);
      final = { pt: end, direction: v };
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(final.pt.x, final.pt.y);
    const baseArrow = final.pt.sub(final.direction.scalar(16));
    const c1 = baseArrow.add(final.direction.perpendicular().scalar(8));
    const c2 = baseArrow.add(final.direction.perpendicular().scalar(-8));
    ctx.lineTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.closePath();
    ctx.fill();
  }

  setPointerDrag() {

  }

  setPointerNormal() {

  }

  drawMultilineText(text: string, x: number, y: number) {
    const lines = text.split('\n');
    if(this.ctx.textBaseline == "bottom") {
      for(let i = 0; i < lines.length; i++) {
        const yi = lines.length - i - 1;
        const py = y - yi * 20;
        this.ctx.fillText(lines[i], x, py);
      }
    } else if(this.ctx.textBaseline == "top") {
      for(let i = 0; i < lines.length; i++) {
        const py = y + i * 20;
        this.ctx.fillText(lines[i], x, py);
      }
    } else if(this.ctx.textBaseline == "middle") {
      const dpy = y - 20 * (lines.length - 1) / 2;
      for(let i = 0; i < lines.length; i++) {
        const py = dpy + i * 20;
        this.ctx.fillText(lines[i], x, py);
      }
    }
  }
}

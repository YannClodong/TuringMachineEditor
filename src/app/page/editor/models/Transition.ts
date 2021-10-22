import TurringOperation from "./TurringAction";
import Vector from "./utils/vector";

export default class Transition {
  constructor(
    public start: number,
    public end: number,
    public action: TurringOperation,
    public direction?: Vector) {

  }
}

import TurringOperation from "./TurringAction";
import Vector from "./utils/vector";

export default class Transition {
  constructor(
    public start: number,
    public end: number,
    public action: TurringOperation,
    public direction?: Vector) {

  }

  toPapazian(transpositionTable: { from: string, to: string }[]) {
    return this.action.toPapazian(transpositionTable).map(trs => trs + " @" + this.end).join("\n")
  }
}

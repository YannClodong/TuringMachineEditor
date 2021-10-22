import Transition from "./Transition";
import TurringMachine from "./TurringMachine";
import TurringOperation from "./TurringAction";
import Vector from "./utils/vector";

export type SavableState = {
  nodeName: number,
  x: number,
  y: number,
  final: boolean,
  transitions: {
    end: number,
    direction: Vector | undefined,
    operation: string
  }[]
}

export default class State {

  constructor(public nodeName: number, public x: number, public y: number, public final: boolean, public transitions: Transition[] = []) {
  }

  public connectTo(state: State, operation: TurringOperation) {
    this.transitions.push(new Transition(this.nodeName, state.nodeName, operation));
  }

  public trigger() {
    for (const tr of this.transitions) {
      if (tr.action.trigger()) {
        return tr.end;
      }
    }
    throw `Deadlock state ${this.nodeName}.`;
  }

  public getSavable(): SavableState {
    return {
      nodeName: this.nodeName,
      x: this.x,
      y: this.y,
      final: this.final,
      transitions: this.transitions.map(tr => {
        return  {
          end: tr.end,
          direction: tr.direction,
          operation: tr.action.serialize()
        }
      })
    }
  }

  static createFromSave(state: SavableState, machine: TurringMachine) {
    return new State(state.nodeName, state.x, state.y, state.final, state.transitions.map(t => {
      return new Transition(state.nodeName, t.end, TurringOperation.create(t.operation, machine), t.direction ? new Vector(t.direction.x, t.direction.y) : undefined)
    }))
  }

  public addTransition(end: number, direction?: Vector, operation: TurringOperation = TurringOperation.empty()) {
    const tr = new Transition(this.nodeName, end, operation, direction);
    this.transitions.push(tr)
    return tr;
  }

  public removeTransition(end: number) {
    this.transitions = this.transitions.filter(t => t.end != end);
  }

  public transitionExistTo(state: number): boolean {
    return !!this.transitions.find(t => t.end == state);
  }
}

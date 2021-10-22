import AtomicTurringOperation, {SavedAtomicTurringOperation} from "./AtomicTurringOperation";
import TurringMachine from "../TurringMachine";

export default class TurringOperation {

  constructor(public conditions: AtomicTurringOperation[]) {
  }

  static empty() {
    return new TurringOperation([])
  }

  static canDeserialize(text: string, nband: number) {
    const atomics = text.split('\n').map(l => l.trim()).filter(l => l != "");
    return atomics
      .map(a => AtomicTurringOperation.canDeserialize(a, nband))
      .reduce((pv, cv) => pv && cv, true);
  }

  static create(label: string, machine: TurringMachine) {
    const atomics = label.split('\n').map(l => l.trim()).filter(l => l != "");
    const atomicOperations = []

    for(const atom of atomics) {
      atomicOperations.push(AtomicTurringOperation.create(atom, machine))
    }

    return new TurringOperation(atomicOperations);
  }

  public canTrigger() {
    for(const cond of this.conditions) {
      if(cond.canTrigger())
        return true;
    }
    return false;
  }

  public trigger() {
    for(const cond of this.conditions) {
      if(cond.trigger())
        return true;
    }
    return false;
  }

  public serialize() {
    return this.conditions.map(c => c.serialize()).join('\n')
  }

  public getSavable() {
    return this.conditions.map(c => c.getSavable());
  }

  static restore(save: SavedAtomicTurringOperation[], machine: TurringMachine) {
    return new TurringOperation(save.map(s => AtomicTurringOperation.restore(s, machine)));
  }

}

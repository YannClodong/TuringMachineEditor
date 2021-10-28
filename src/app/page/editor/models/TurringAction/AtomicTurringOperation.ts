import TurringMachine from "../TurringMachine";
import {blankCharacter} from "../Turring/Band";

const buildRegex = (bandSize: number) => {
  const valueBand = []
  const dirBand = []
  for(let i = 0; i < bandSize; i++) {
    valueBand.push("([^ \\t\\|]{1,})");
    dirBand.push("([<>v]{1})");
  }

  return ["^", ...valueBand, "\\|", ...valueBand, "\\|", dirBand.join("[ \\t]*"), "$"].join("[ \\t]*")
}

export type  SavedAtomicTurringOperation = {
  reads: string[],
  writes: string[],
  movements: ("RIGHT"|"LEFT"|"STAT")[]
}

type Subatomic = { read: string, write: string, move: "RIGHT"|"LEFT"|"STAT" }
type Combinaison = Subatomic[]
type Possibilities = Subatomic[]

export default class AtomicTurringOperation {

  constructor(public reading: string[], public writing: string[], public movements: ("RIGHT"|"LEFT"|"STAT")[], private machine: TurringMachine) {
    this.checkErrors();
  }

  private checkErrors() {
    if(this.reading.length != this.machine.nband || this.writing.length != this.machine.nband || this.movements.length != this.machine.nband)
      throw this.serialize() + " - have a wrong format.";
  }

  static create(label: string, machine: TurringMachine) {
    const nband = machine.nband;
    const stringRegex = buildRegex(nband);
    const regexValidator = new RegExp(stringRegex);

    const groups = regexValidator.exec(label);
    if(!groups || groups.length == 0 || groups.length != nband * 3 + 1)
      throw `TurringOperationBadFormat: '${label}'`;

    const readings = groups.slice(1, nband + 1);
    const writings = groups.slice(nband + 1, 2 * nband + 1);
    const directions = groups.slice(2 * nband + 1, 3 * nband + 1).map(d => (d == "<" ? "LEFT": (d == ">" ? "RIGHT" : "STAT")));

    return new AtomicTurringOperation(readings, writings, directions, machine);
  }

  static canDeserialize(text: string, nband: number) {
    const stringRegex = buildRegex(nband);
    console.log(stringRegex)
    const regexValidator = new RegExp(stringRegex);

    const groups = regexValidator.exec(text);
    if(!groups || groups.length == 0 || groups.length != nband * 3 + 1)
      return false;

    return true;
  }

  public canTrigger() {
    return this.reading.map((r, i) => this.machine.readband(i) == r || (this.machine.readband(i) == blankCharacter && r == "b") || r == ".").reduce((pv, cv) => pv && cv, true)
  }

  public trigger() {
    const conditionReached = this.canTrigger()
    if(!conditionReached) return false;

    for(const {v, i} of this.writing.map((v, i) => { return { v: v, i: i }})) {
      if(v == ".") {
        this.machine.movebandpointer(i, this.movements[i]);
      } else {
        this.machine.writeonband(i, v == "b" ? blankCharacter : v);
        this.machine.movebandpointer(i, this.movements[i]);
      }
    }
    return true;
  }

  public serialize() {
    return this.reading.join(' ') + "|" + this.writing.join(' ') + "|" + this.movements.map(m => (m == "RIGHT" ? ">" : (m == "LEFT" ? "<" : "v"))).join(" ")
  }

  public deserialize(text: string, nband: number) {
    const stringRegex = buildRegex(nband);
    const regexValidator = new RegExp(stringRegex);

    const groups = regexValidator.exec(text);
    if(!groups || groups.length == 0 || groups.length != nband * 3 + 1)
      throw `TurringOperationBadFormat: '${text}'`;

    const readings = groups.slice(1, nband + 1);
    const writings = groups.slice(nband + 1, 2 * nband + 1);
    const directions = groups.slice(2 * nband + 1, 3 * nband + 1)
      .map(d => (d == "<" ? "LEFT": (d == ">" ? "RIGHT" : "STAT")));

    this.reading = readings
    this.writing = writings
    this.movements = directions
  }

  public getSavable(): SavedAtomicTurringOperation {
    return {
      reads: this.reading,
      writes: this.writing,
      movements: this.movements
    }
  }



  toPapazian(transpositionTable: { from: string, to: string }[]) {
    const alphabet = this.machine.getAlphabet();
    const elements = this.reading.map((v, i) => {
      return {
        read: v,
        write: this.writing[i],
        move: this.movements[i]
      }
    }).map(e => {
      if(e.read == ".") {
        return alphabet.map(a => {
          return {
            read: a,
            write: e.write == "." ? (e.read == "." ? a : e.read) : e.write,
            move: e.move
          } as Subatomic
        })
      } else {
        return [{
          read: e.read,
          write: e.write == "." ? e.read : e.write,
          move: e.move
        } as Subatomic]
      }
    })

    const combis = this.customScalar(1, elements, []);
    console.log(combis)

    const result = combis.map(c => {
      return {
        read: c.map(c => c.read).map(c => transpositionTable.find(t => t.from == c)?.to || "ERR"),
        write: c.map(c => c.write).map(c => transpositionTable.find(t => t.from == c)?.to || "ERR"),
        move: c.map(c => c.move)
      }
    })

    return result.map(r => r.read.map(re => "'" + re).join(",") + " " + r.write.map(w => "'" + w).join(",") + " " + r.move.map(m => m == "RIGHT" ? "R" : (m == "LEFT" ? "L" : "S")).join(","))
  }

  private customScalar(i: number, elements: Possibilities[], current: Combinaison[]): Combinaison[] {
    if(current.length == 0)
      return this.customScalar(1, elements, elements[0].map(e => [e]));
    else {
      if(i >= this.reading.length) return current;
      return this.customScalar(i + 1, elements, elements[i].map(e => {
        return current.map(c => {
          return [...c, e];
        })
      }).reduce((pv, cv) => [...pv, ...cv], []))
    }
  }

  static restore(save: SavedAtomicTurringOperation, machine: TurringMachine) {
    return new AtomicTurringOperation(save.reads, save.writes, save.movements, machine);
  }
}

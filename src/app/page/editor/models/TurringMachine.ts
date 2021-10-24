import Band, {SavedBand} from "./Turring/Band";
import State, {SavableState} from "./State";
import Transition from "./Transition";

export type SavedTurringMachine = {
  bands: SavedBand[],
  states: SavableState[]
}


export default class TurringMachine {
  public states: State[] = []
  private finished = false;
  //private edges: Transition[] = []
  private statePointer: number = 0;
  public nband = 0;


  constructor(public bands: Band[]) {
    this.nband = bands.length;
  }

  static init(bands: Band[]) {
    const machine = new TurringMachine(bands);
    machine.addnode(100, 100);
    return machine;
  }

  static createFromSave(save: SavedTurringMachine) {
    const machine = new TurringMachine(save.bands.map(b => new Band(b.init, b.startPosition)))
    save.states.forEach(s => machine.states.push(State.createFromSave(s, machine)))
    return machine;
  }

  public readband(band: number) {
    if(band < 0 || band >= this.nband)
      throw "Invalid band";
    return this.bands[band].read();
  }

  public writeonband(band: number, value: string) {
    if(band < 0 || band >= this.nband)
      throw "Invalid band";
    this.bands[band].write(value);
  }

  public movebandpointer(band: number, direction: "RIGHT"|"LEFT"|"STAT") {
    if(band < 0 || band >= this.nband)
      throw "Invalid band";
    this.bands[band].move(direction);
  }

  public addnode(x: number, y: number) {
    const node = new State(this.getNodeName(), x, y, false);
    this.states.push(node)
    return node;
  }

  private getNodeName() {
    let i = 0;
    for(; this.states.find(s => s.nodeName == i); i++) ;
    return i;
  }

  public makeExecutionError() {
    this.finished = true;
    alert("Finish with error case")
  }

  public makeExecutionSuccess() {
    this.finished = true
    alert("Success")
  }

  public tick() {
    const state = this.states.find(s => s.nodeName == this.statePointer)
    if(!state) throw `State ${state} don't exist.`;

    if(this.finished) return;

    try {
      const newState = state.trigger();
      this.moveToState(newState);
    } catch(err) {
      console.log(err)
      this.makeExecutionError();
      this.finished = true;
    }
  }

  public moveToState(stateId: number) {
    //if(state < 0 || state >= this.states.length)
    const state = this.states.find(s => s.nodeName == stateId);
    if(!state) throw `State ${state} don't exist.`;
    this.statePointer = state.nodeName;

    if(state.final)
      this.makeExecutionSuccess();
  }

  public removeState(state: number) {
    this.states = this.states.filter(s => s.nodeName != state)
    for(const s of this.states) {
      s.removeTransition(state);
    }
  }

  isNodeActive(stateName: number) {
    return this.statePointer === stateName;
  }

  getSavable() {
    return {
      states: this.states.map(s => s.getSavable()),
      bands: this.bands.map(b => b.getSavable())
    } as SavedTurringMachine
  }

  public reset() {
    this.bands.forEach(b => b.reset());
    this.statePointer = 0;
    this.finished = false;
  }

  setStateActive(stateName: number) {
    this.reset();
    while(this.statePointer != stateName && !this.finished) this.tick();
  }

  isFinished() {
    return this.finished;
  }

  retry() {
    this.finished = false;
  }
}
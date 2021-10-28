import { Injectable } from '@angular/core';
import Band, {SavedBand} from "../page/editor/models/Turring/Band";
import {SavedTurringMachine} from "../page/editor/models/TurringMachine";
import State, {SavableState} from "../page/editor/models/State";

export type SavedDictionnaryTuple = { id: number, name: string, machine: SavedTurringMachine };
export type ProjectPreview = { id: number, name: string, nbands: number, nstates: number };

@Injectable({
  providedIn: 'root'
})
export class TurringGraphManagerService {
  private machines: SavedDictionnaryTuple[] = [];

  constructor() {
    this.load();
  }

  load() {
    const saved = localStorage.getItem("machines");
    if(saved) {
      this.machines = JSON.parse(saved) as SavedDictionnaryTuple[];
    }
  }

  private save() {
    localStorage.setItem("machines", JSON.stringify(this.machines));
  }

  savemachine(id: number, machine: SavedTurringMachine, machineName?: string) {
    this.load();
    const tuple = this.machines.find(s => s.id == id)
    let name = machineName || "Noname"
    if (tuple) {
      name = tuple.name;
      this.machines = this.machines.filter(m => m.id != id);
    }
    this.machines.push({
      id,
      name,
      machine
    });
    this.save();
  }



  create(name: string, bands: SavedBand[]) {
    const machine = {
      bands,
      states: [
        { x: 100, y: 100, final: false, nodeName: 0, transitions: [] } as SavableState
      ]
    } as SavedTurringMachine
    const id = this.getFreeId();
    this.machines.push({
      id,
      name,
      machine
    });
    this.save();
    return id;
  }

  list() {
    this.load();
    return this.machines.map(m => {
      return {
        id: m.id,
        name: m.name,
        nbands: m.machine.bands.length,
        nstates: m.machine.states.length
      } as ProjectPreview
    })
  }

  private getFreeId() {
    this.load();
    let i = 0;
    for(; this.machines.find(m => m.id == i); i++);
    return i;
  }

  get(id: number) {
    this.load();
    console.log(this.machines)
    const machine = this.machines.find(s => s.id == id)?.machine
    if(!machine) throw "Graph not found";
    return machine;
  }

  remove(id: number) {
    this.load()
    this.machines = this.machines.filter(m => m.id != id);
    this.save()
  }

  exportAll() {
    this.load();
    download("AllTurringGraphs.json", JSON.stringify(this.machines));
  }

  exportOne(id: number) {
    this.load();
    const machine = this.machines.find(m => m.id == id)
    if(!machine) throw "Machine not found";
    download(machine.name + ".json", JSON.stringify(machine));
  }

  importMachines(text: string) {
    this.load();
    const machines: SavedDictionnaryTuple[] = JSON.parse(text)
    for(const machine of machines)
      this.savemachine(this.getFreeId(), machine.machine, machine.name)
    this.save();
  }

}


export function download(filename: string, text: string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

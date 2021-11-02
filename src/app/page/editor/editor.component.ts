import {Component, OnInit, ViewChild} from '@angular/core';
import AtomicTurringOperation from "./models/TurringAction/AtomicTurringOperation";
import TurringMachine, {SavedTurringMachine} from "./models/TurringMachine";
import TurringMachineDrawer from "./models/drawers/TurringMachineDrawer";
import IDrawable from "./models/drawers/IDrawable";
import DrawingUtils from "./models/drawers/DrawingUtils";
import Vector from "./models/utils/vector";
import Band from "./models/Turring/Band";
import {ActivatedRoute} from "@angular/router";
import {download, TurringGraphManagerService} from "../../services/turring-graph-manager.service";

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less']
})
export class EditorComponent implements OnInit {

  canvas?: HTMLCanvasElement;

  drawInspector = false
  public machine?: TurringMachine;
  private machineDrawer?: TurringMachineDrawer;
  public showToPapazian = false;
  private machineId?: number;
  private drawables: IDrawable[] = [];
  private ctx: CanvasRenderingContext2D|null = null;
  private selection: IDrawable[] = []
  public inspectorItem?: IDrawable;
  public bands: Band[] = [];

  public transpositionTable: { from: string, to: string, error: boolean }[] = []

  public showBandEditor = false;

  private run = false;

  private mouseDownOn?: { element?: IDrawable, mousePosition: Vector, startOffet: Vector, button: number };

  private canvasContainer?: HTMLDivElement;

  width: number = 0;
  height: number = 0;
  offset: Vector = new Vector(-200, 0);

  constructor(private aroute: ActivatedRoute, private graphManager: TurringGraphManagerService) {

    aroute.params.subscribe((values) => {
      const graphId = values["graph"] as number;
      this.drawables = [];
      this.machineId = graphId;
      this.machine = TurringMachine.createFromSave(graphManager.get(graphId))

      this.bands = []
      this.bands = this.machine.bands;
      console.log(this.machine)

      this.machineDrawer = new TurringMachineDrawer(this.machine);

      this.transpositionTable = this.machine.getAlphabet().map(l => {
        return {
          from: l,
          to: l == "b" ? "_" : l,
          error: false
        }
      })

      this.addelement(this.machineDrawer)
      this.onMachineReset();
      this.draw();
    })

    window.addEventListener("resize", () => this.ajustCanvasSize());
    window.addEventListener("keydown", (ev) => this.onKeyDown(ev))
  }

  addelement(element: IDrawable) {
    this.drawables.push(element);
    this.draw();
  }

  private getelement() {
    const result = this.drawables.map(d => this.getsubelements(d)).reduce((pv, cv) => [...pv, ...cv], []);
    return result;
  }
  private getsubelements(el: IDrawable) {
    const result = [el];
    const children = el.children();
    if(children.length != 0)
      result.push(...children.map(c => this.getsubelements(c)).reduce((pv, cv) => [...pv, ...cv], []));
    return result;
  }

  ngOnInit(): void {
    //this.timer();
    this.canvas = document.getElementById("editor-canvas") as HTMLCanvasElement;
    this.canvasContainer = document.getElementById("editor-canvas-container") as HTMLDivElement;

    this.ajustCanvasSize();
  }

  ajustCanvasSize() {
    if(this.canvas && this.canvasContainer) {
      this.width = this.canvasContainer.offsetWidth;
      this.height = this.canvasContainer.offsetHeight;

      this.timer();
    }
  }

  timer() {
    setTimeout(() => this.draw(), 100)
  }

  draw() {
    if(this.canvas && !this.ctx)
      this.ctx = this.canvas.getContext("2d")

    if(!this.ctx) return;
    //this.clear();

    const utils = new DrawingUtils(this.ctx, this.offset);
    const elements = this.getelement();

    this.clear();

    elements.forEach(d => {
      if(this.ctx)
        d.draw(this.ctx, utils, this.selection.includes(d))
    })
  }

  getCanvasWorldPosition(x: number, y: number) {
    if(!this.canvas) return new Vector(x, y);
    return new Vector(x - this.canvas.offsetLeft + this.offset.x,y - this.canvas.offsetTop + this.offset.y)
  }

  getCanvasPosition(x: number, y: number) {
    if(!this.canvas) return new Vector(x, y);
    return new Vector(x - this.canvas.offsetLeft,y - this.canvas.offsetTop)
  }

  clear() {
    if(this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      /*const w = this.canvas.width;
      this.canvas.width = 1;
      this.canvas.width = w;*/
    }
  }

  onCanvasDrag(ev: MouseEvent) {
    if(this.mouseDownOn && this.mouseDownOn.element) {
      const pos = this.getCanvasWorldPosition(ev.x, ev.y);
      this.mouseDownOn.element.onDrag(pos.x, pos.y);
      this.draw();
      this.save();
    }
  }

  onCanvasRightDrag(ev: MouseEvent) {
    if(this.mouseDownOn && this.ctx && this.mouseDownOn.element) {
      const pos = this.getCanvasWorldPosition(ev.x, ev.y);
      this.mouseDownOn.element.onDragRight(ev.x, ev.y);
      this.draw();
    }
  }

  middleClickDrag(ev: MouseEvent) {
    if(!this.mouseDownOn) return;
    const pos = this.getCanvasWorldPosition(ev.x, ev.y)

    this.offset = this.mouseDownOn.startOffet.add(this.mouseDownOn.mousePosition.sub(new Vector(ev.x, ev.y)))
    this.draw();
  }

  onMouseOver(ev: MouseEvent) {
    const pos = this.getCanvasWorldPosition(ev.x, ev.y)
    switch (ev.buttons) {
      case 1:
        this.onCanvasDrag(ev);
        break;
      case 2:
        this.onCanvasRightDrag(ev);
        break;
      case 4:
        this.middleClickDrag(ev);
        break;
    }
  }

  onMouseDown(ev: MouseEvent) {
    const elements = this.getelement();
    const pos = this.getCanvasWorldPosition(ev.x, ev.y);
    const rpos = this.getCanvasPosition(ev.x, ev.y);
    const res = elements.find(e => e.isOver(pos.x, pos.y, rpos.x, rpos.y))

    this.mouseDownOn = { mousePosition: rpos, startOffet: new Vector(this.offset.x, this.offset.y), button: ev.buttons, element: res };
    res?.onMouseDown(pos.x, pos.y, rpos.x, rpos.y);

    this.selection = []
    if(res)
      this.selection.push(res)

    elements.filter(e => e != res).forEach(e => e.onLoseFocus());


    //this.updateInspector()
    this.draw();
    this.save();
  }

  onResize(ev: UIEvent) {
    console.log("Resizing")
    this.ajustCanvasSize();
  }

  onMouseUp(ev: MouseEvent) {

    if(this.mouseDownOn && this.mouseDownOn.element) {

      const elements = this.getelement();
      const pos = this.getCanvasWorldPosition(ev.x, ev.y);
      const rpos = this.getCanvasPosition(ev.x, ev.y);

      if(rpos.sub(this.mouseDownOn.mousePosition).length() > 50)
        this.selection = [];

      const res = elements.find(e => e.isOver(pos.x, pos.y, rpos.x, rpos.y))
      switch (this.mouseDownOn.button) {
        case 1:
          this.mouseDownOn.element.onDrop(pos.x, pos.y, res);
          break;
        case 2:
          this.mouseDownOn.element.onDropRight(pos.x, pos.y, res);
          break;
      }
    }

    this.updateInspector();
    this.draw();
    this.save();
  }

  updateInspector() {
    if(this.selection.length == 0)
      this.drawInspector = false;
    else {
      this.inspectorItem = this.selection[0];
      this.drawInspector = true;
    }
  }

  onDeletePress() {
    console.log("Delete pressed")
    this.selection.forEach(s => s.onSupprButtonPressed());
    this.draw();
    this.save();
  }

  onKeyUp(ev: KeyboardEvent) {

  }

  onKeyDown(ev: KeyboardEvent) {
    switch (ev.key) {
      case "Delete":
        this.onDeletePress();
        break;
    }
  }

  onMachineTick() {
    if(!this.machine) return;
    this.machine.retry();
    this.machine.tick();
    this.draw();
  }

  onMachineReset() {
    if(!this.machine) return;

    this.machine.reset();
    this.bands = [];
    this.bands = this.machine.bands;
    this.draw();
  }

  save() {
    if(!this.machineId || !this.machine) return;
    this.graphManager.savemachine(this.machineId, this.machine.getSavable());
    //localStorage.setItem("turring", JSON.stringify(this.machine.getSavable()));
  }

  onMachineRun() {
    this.run = !this.run;
    if(this.run)
      this.RunClock();
  }

  RunClock() {
    if(!this.run) return;
    this.onMachineTick();

    if(this.machine?.isFinished()) return;
    setTimeout(() => this.RunClock(), 500);
  }

  checkTranspositionTable() {
    let error = false;
    this.transpositionTable.forEach(v => {
      if(v.to.length != 1) {
        v.error = true;
        error = true;
      }
      else if(this.transpositionTable.filter(v2 => v2.to == v.to).length != 1) {
        v.error = true;
        error = true;
      } else {
        v.error = false;
      }
    })
    return error;
  }

  checkTranspo() {
    if(!this.machine) return;
    const transpositionTable = this.machine.getAlphabet().map(l => {
      return {
        from: l,
        to: l == "b" ? "_" : l,
        error: false
      }
    })

    const addition = [...this.transpositionTable, ...transpositionTable];
    const union = addition.filter((e, i) => i === addition.findIndex(v => v.from === e.from))

    this.transpositionTable = union;
  }

  toPapazian(errorMessage: string) {
    if(!this.machine) return;

    if(this.checkTranspositionTable()) return;
    download("Papazian.txt", this.machine.convertToPapazianSyntax("machineName", "VALID", errorMessage, this.transpositionTable))
  }
}

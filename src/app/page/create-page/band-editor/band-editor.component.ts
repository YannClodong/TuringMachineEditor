import {Component, Input, OnInit} from '@angular/core';
import Band, {SavedBand} from "../../editor/models/Turring/Band";

@Component({
  selector: 'app-band-editor',
  templateUrl: './band-editor.component.html',
  styleUrls: ['./band-editor.component.less']
})
export class BandEditorComponent implements OnInit {

  @Input() bandNumber: number = 1;
  @Input() canDelete: boolean = true;
  @Input() deleteBand: () => void = () => {}
  @Input() band: SavedBand = { initialData: [], startPosition: "RIGHT" }

  public content: string = "";
  constructor() { }

  ngOnInit(): void {
    if(this.band.initialData.find(v => v.length != 1)) {
      this.content = this.band.initialData.join("|")
    } else {
      this.content = this.band.initialData.join("")
    }
  }

  updateBand() {
    this.band.initialData = this.getArray();
  }

  private getArray() {
    if(this.content.includes("|")) {
      return this.content.split("|").map(v => v.trim()).filter(v => v != "");
    } else {
      const res = []
      for(let i = 0; i < this.content.length; i++) {
        res.push(this.content.slice(i, i + 1));
      }
      return res;
    }
  }
}

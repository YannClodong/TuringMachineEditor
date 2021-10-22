import { Component, OnInit } from '@angular/core';
import Band, {SavedBand} from "../editor/models/Turring/Band";
import {TurringGraphManagerService} from "../../services/turring-graph-manager.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.less']
})
export class CreatePageComponent implements OnInit {

  name: string = "";
  bands: SavedBand[] = [];

  constructor(private graphManager: TurringGraphManagerService, private router: Router) { }

  ngOnInit(): void {
  }

  getBandWithNumbers(){
    return this.bands.map((b, i) => {
      return {
        number: i + 1,
        band: b
      }
    })
  }

  create() {
    const id = this.graphManager.create(this.name, this.bands);
    this.router.navigate(["editor", id])
  }

}

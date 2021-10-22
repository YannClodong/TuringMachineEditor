import { Component, OnInit } from '@angular/core';
import {ProjectPreview, TurringGraphManagerService} from "../../services/turring-graph-manager.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-open-page',
  templateUrl: './open-page.component.html',
  styleUrls: ['./open-page.component.less']
})
export class OpenPageComponent implements OnInit {

  constructor(private graphManager: TurringGraphManagerService, private router: Router) { }

  ngOnInit(): void {
  }

  getProjects() {
    return this.graphManager.list();
  }

  loadGraph(p: ProjectPreview) {
    this.router.navigate(["editor", p.id])
  }

  onCreatePressed() {
    this.router.navigate(["new"]);
  }
}

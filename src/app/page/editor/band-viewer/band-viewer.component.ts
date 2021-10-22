import {Component, Input, OnInit} from '@angular/core';
import Band from "../models/Turring/Band";

@Component({
  selector: 'app-band-viewer',
  templateUrl: './band-viewer.component.html',
  styleUrls: ['./band-viewer.component.less']
})
export class BandViewerComponent implements OnInit {

  @Input() offset: number = 0;
  @Input() band: Band = new Band(["N", "O", "N", "E"], "LEFT");

  constructor() { }

  ngOnInit(): void {
  }

}

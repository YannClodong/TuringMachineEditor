import {Component, Input, OnInit} from '@angular/core';
import Vector from "../models/utils/vector";
import {Style} from "@angular/cli/lib/config/workspace-schema";

@Component({
  selector: 'app-toolbox-button',
  templateUrl: './toolbox-button.component.html',
  styleUrls: ['./toolbox-button.component.less']
})
export class ToolboxButtonComponent implements OnInit {

  @Input() offsetX: number = 0;
  @Input() offsetY: number = 0;
  @Input() color: string = "#2c3e50";
  @Input() icon: string = "fas fa-play";

  constructor() { }

  ngOnInit(): void {
  }

  getIconStyle() {
    return {
      "margin-left": this.offsetX,
      "margin-top": this.offsetY
    }
  }

}

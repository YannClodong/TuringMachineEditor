import {Component, Input, OnInit} from '@angular/core';
import TurringStateDrawer from "../../models/drawers/TurringStateDrawer";

@Component({
  selector: 'app-node-inspector',
  templateUrl: './node-inspector.component.html',
  styleUrls: ['./node-inspector.component.less']
})
export class NodeInspectorComponent implements OnInit {

  @Input() element?: TurringStateDrawer;

  constructor() { }

  ngOnInit(): void {
  }

}

import {Component, Input, OnInit} from '@angular/core';
import IDrawable, {DrawableType} from "../../models/drawers/IDrawable";
import TurringStateDrawer from "../../models/drawers/TurringStateDrawer";
import TurringTransitionDrawer from "../../models/drawers/TurringTransitionDrawer";

@Component({
  selector: 'app-inspector-selector',
  templateUrl: './inspector-selector.component.html',
  styleUrls: ['./inspector-selector.component.less']
})
export class InspectorSelectorComponent implements OnInit {

  @Input() public element?: IDrawable;


  constructor() { }

  ngOnInit(): void {
  }

  isState() {
    return this.element && this.element.getType() === DrawableType.TURRING_STATE;
  }

  isTransition() {
    return this.element && this.element.getType() === DrawableType.TURRING_OPERATION;
  }

  getStateDrawer() {
    return this.element as TurringStateDrawer;
  }

  getTransitionDrawer() {
    return this.element as TurringTransitionDrawer;
  }
}

import {Component, Input, OnInit} from '@angular/core';
import TurringTransitionDrawer from "../../models/drawers/TurringTransitionDrawer";
import TurringAction from '../../models/TurringAction';

@Component({
  selector: 'app-transition-inspector',
  templateUrl: './transition-inspector.component.html',
  styleUrls: ['./transition-inspector.component.less']
})
export class TransitionInspectorComponent implements OnInit {

  @Input() element?: TurringTransitionDrawer;
  public error?: string;

  constructor() { }


  ngOnInit(): void {
  }

  onOperationInput($event: KeyboardEvent, input: HTMLTextAreaElement) {
    if(!this.element) return;
    const text = input.value;
    console.log(this.element.machineDrawer.machine.bands.length);
    const parsingError = !TurringAction.canDeserialize(text, this.element.machineDrawer.machine.bands.length);

    if(parsingError) {
      this.error = "Parsing error";
      return;
    }

    this.element.setOperation(text);
  }
}

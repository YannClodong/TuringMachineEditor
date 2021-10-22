import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-inspector-header',
  templateUrl: './inspector-header.component.html',
  styleUrls: ['./inspector-header.component.less']
})
export class InspectorHeaderComponent implements OnInit {

  @Input() text: string = "-";
  constructor() { }

  ngOnInit(): void {
  }

}

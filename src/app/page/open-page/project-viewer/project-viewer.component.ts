import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProjectPreview, TurringGraphManagerService} from "../../../services/turring-graph-manager.service";

@Component({
  selector: 'app-project-viewer',
  templateUrl: './project-viewer.component.html',
  styleUrls: ['./project-viewer.component.less']
})
export class ProjectViewerComponent implements OnInit {

  @Output() pressed: EventEmitter<void> = new EventEmitter<void>();
  @Input() projectPreview?: ProjectPreview

  constructor(private graphManager: TurringGraphManagerService) { }

  ngOnInit(): void {
  }

  onDelete() {
    if(this.projectPreview)
      this.graphManager.remove(this.projectPreview.id);
  }
}

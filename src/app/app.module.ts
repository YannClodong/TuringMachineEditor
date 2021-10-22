import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GenericPageComponent } from './page/generic-page/generic-page.component';
import { EditorComponent } from './page/editor/editor.component';
import { InspectorHeaderComponent } from './page/editor/inspector/inspector-header/inspector-header.component';
import { NodeInspectorComponent } from './page/editor/inspector/node-inspector/node-inspector.component';
import { InspectorSelectorComponent } from './page/editor/inspector/inspector-selector/inspector-selector.component';
import { TransitionInspectorComponent } from './page/editor/inspector/transition-inspector/transition-inspector.component';
import { BandViewerComponent } from './page/editor/band-viewer/band-viewer.component';
import { ToolboxButtonComponent } from './page/editor/toolbox-button/toolbox-button.component';
import {FormsModule} from "@angular/forms";
import { OpenPageComponent } from './page/open-page/open-page.component';
import { CreatePageComponent } from './page/create-page/create-page.component';
import { BandEditorComponent } from './page/create-page/band-editor/band-editor.component';
import { ProjectViewerComponent } from './page/open-page/project-viewer/project-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    GenericPageComponent,
    EditorComponent,
    InspectorHeaderComponent,
    NodeInspectorComponent,
    InspectorSelectorComponent,
    TransitionInspectorComponent,
    BandViewerComponent,
    ToolboxButtonComponent,
    OpenPageComponent,
    CreatePageComponent,
    BandEditorComponent,
    ProjectViewerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

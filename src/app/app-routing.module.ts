import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {EditorComponent} from "./page/editor/editor.component";
import {CreatePageComponent} from "./page/create-page/create-page.component";
import {OpenPageComponent} from "./page/open-page/open-page.component";

const routes: Routes = [
  { path: "", component: OpenPageComponent },
  { path: "new", component: CreatePageComponent},
  { path: "editor/:graph", component: EditorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

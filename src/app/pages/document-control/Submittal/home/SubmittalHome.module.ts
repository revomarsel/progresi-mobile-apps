import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { SubmittalHome } from "./SubmittalHome";
import { LibsModule } from "components/libs.module";
import { VirtualScrollerModule } from "ngx-virtual-scroller";

const routes: Routes = [
  {
    path: "",
    component: SubmittalHome,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LibsModule,
    VirtualScrollerModule,
  ],
  declarations: [SubmittalHome],
})
export class SubmittalHomeModule {}

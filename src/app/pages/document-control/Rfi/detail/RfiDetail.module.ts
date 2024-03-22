import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { RfiDetail } from "./RfiDetail";
import { LibsModule } from "components/libs.module";
import { VirtualScrollerModule } from "ngx-virtual-scroller";

const routes: Routes = [
  {
    path: "",
    component: RfiDetail,
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
  declarations: [RfiDetail],
})
export class RfiDetailModule {}

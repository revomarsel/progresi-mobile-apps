import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { InputRfi } from "./InputRfi";
import { LibsModule } from "components/libs.module";
import { VirtualScrollerModule } from "ngx-virtual-scroller";
import { TagInputModule } from "ngx-chips";
TagInputModule.withDefaults({
  tagInput: {
    placeholder: "Klik Untuk Pilih",
    secondaryPlaceholder: "Klik Untuk Pilih",
  },
});
import { IonicSelectableModule } from "ionic-selectable";

import { IonicStorageModule } from "@ionic/storage";

const routes: Routes = [
  {
    path: "",
    component: InputRfi,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LibsModule,
    VirtualScrollerModule,
    TagInputModule,
    IonicSelectableModule,
    IonicStorageModule.forRoot(),
  ],
  declarations: [InputRfi],
})
export class InputRfiModule {}

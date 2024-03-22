import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicSelectableModule } from "ionic-selectable";
import {
  HeaderGlobal,
  Tabs,
  Options,
  Filter,
  PopOver,
  CustomFilterPage,
  Accordion,
  Card,
  ProgressBar,
  InputNumber,
  Stepper,
} from "./provider";
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [CommonModule, IonicSelectableModule, FormsModule],
  declarations: [
    HeaderGlobal,
    Tabs,
    Options,
    Filter,
    PopOver,
    CustomFilterPage,
    Accordion,
    Card,
    ProgressBar,
    InputNumber,
    Stepper,
  ],
  exports: [
    HeaderGlobal,
    Tabs,
    Options,
    Filter,
    PopOver,
    CustomFilterPage,
    Accordion,
    Card,
    ProgressBar,
    InputNumber,
    Stepper,
  ],
})
export class LibsModule {}

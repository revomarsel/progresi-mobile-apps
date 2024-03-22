import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Charts } from './provider';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    Charts
  ],
  exports: [
    Charts
  ]
})

export class ChartsModule { }
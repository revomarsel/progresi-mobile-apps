import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MethodDetails } from './MethodDetails';
import { LibsModule } from 'components/libs.module';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { ChartsModule } from 'components/charts.module';

const routes: Routes = [
  {
    path: '',
    component: MethodDetails
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LibsModule,
    VirtualScrollerModule,
    ChartsModule
  ],
  declarations: [MethodDetails]
})
export class MethodDetailsModule {}

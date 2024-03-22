import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { Planning } from './Planning';
import { LibsModule } from 'components/libs.module';

const routes: Routes = [
  {
    path: '',
    component: Planning
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LibsModule
  ],
  declarations: [Planning]
})
export class PlanningModule {}

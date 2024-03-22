import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SubconReports } from './SubconReports';
import { LibsModule } from 'components/libs.module';

const routes: Routes = [
  {
    path: '',
    component: SubconReports
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
  declarations: [SubconReports]
})
export class SubconReportsModule {}

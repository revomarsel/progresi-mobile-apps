import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProjectProgressPage } from './project-progress.page';
import { LibsModule } from 'components/libs.module';
import { ChartsModule } from 'components/charts.module';

const routes: Routes = [
  {
    path: '',
    component: ProjectProgressPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LibsModule,
    ChartsModule
  ],
  declarations: [ProjectProgressPage]
})
export class ProjectProgressPageModule {}

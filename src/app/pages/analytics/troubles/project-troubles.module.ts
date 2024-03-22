import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProjectTroublesPage } from './project-troubles.page';
import { LibsModule } from 'components/libs.module';

const routes: Routes = [
  {
    path: '',
    component: ProjectTroublesPage
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
  declarations: [ProjectTroublesPage]
})
export class ProjectTroublesPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProjectEquipmentsPage } from './project-equipments.page';
import { LibsModule } from 'components/libs.module';

const routes: Routes = [
  {
    path: '',
    component: ProjectEquipmentsPage
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
  declarations: [ProjectEquipmentsPage]
})
export class ProjectEquipmentsPageModule {}

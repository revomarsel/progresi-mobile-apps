import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProjectSubcon } from './ProjectSubcon';
import { LibsModule } from 'components/libs.module';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

const routes: Routes = [
  {
    path: '',
    component: ProjectSubcon
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LibsModule,
    VirtualScrollerModule
  ],
  declarations: [ProjectSubcon]
})
export class ProjectSubconModule {}

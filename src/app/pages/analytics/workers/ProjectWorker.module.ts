import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProjectWorker } from './ProjectWorker';
import { LibsModule } from 'components/libs.module';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { ChartsModule } from 'components/charts.module';

const routes: Routes = [
  {
    path: '',
    component: ProjectWorker
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
  declarations: [ProjectWorker]
})
export class ProjectWorkerModule {}

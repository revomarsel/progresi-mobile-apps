import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PesanThreadPage } from './pesan-thread.page';
import { LibsModule } from 'components/libs.module';

const routes: Routes = [
  {
    path: '',
    component: PesanThreadPage
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
  declarations: [PesanThreadPage]
})
export class PesanThreadPageModule {}

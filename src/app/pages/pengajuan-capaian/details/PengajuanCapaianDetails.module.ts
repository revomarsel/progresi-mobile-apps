import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PengajuanCapaianDetails } from './PengajuanCapaianDetails';
import { LibsModule } from 'components/libs.module';
import { IonicSelectableModule } from 'ionic-selectable';

const routes: Routes = [
  {
    path: '',
    component: PengajuanCapaianDetails
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LibsModule,
    IonicSelectableModule
  ],
  declarations: [PengajuanCapaianDetails]
})
export class PengajuanCapaianDetailsModule {}

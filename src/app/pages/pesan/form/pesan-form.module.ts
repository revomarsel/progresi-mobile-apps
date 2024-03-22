import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PesanFormPage } from './pesan-form.page';

import { IonicSelectableModule } from 'ionic-selectable';

import { IonicStorageModule } from '@ionic/storage';
import { LibsModule } from 'components/libs.module';

const routes: Routes = [
  {
    path: '',
    component: PesanFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    IonicSelectableModule,
    IonicStorageModule.forRoot(),
    LibsModule
  ],
  providers: [
  ],
  declarations: [PesanFormPage]
})
export class PesanFormPageModule {}

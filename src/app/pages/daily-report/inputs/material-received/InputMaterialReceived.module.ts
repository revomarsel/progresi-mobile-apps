import { Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InputMaterialReceived } from './InputMaterialReceived';
import { LibsModule } from 'components/libs.module';
import { IonicSelectableModule } from 'ionic-selectable';

const routes: Routes = [
  {
    path: '',
    component: InputMaterialReceived
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
  declarations: [InputMaterialReceived]
})
export class InputMaterialReceivedModule {}

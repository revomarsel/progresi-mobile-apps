import { Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InputEquipmentDemob } from './InputEquipmentDemob';
import { LibsModule } from 'components/libs.module';
import { IonicSelectableModule } from 'ionic-selectable';

const routes: Routes = [
  {
    path: '',
    component: InputEquipmentDemob
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
  declarations: [InputEquipmentDemob]
})
export class InputEquipmentDemobModule {}

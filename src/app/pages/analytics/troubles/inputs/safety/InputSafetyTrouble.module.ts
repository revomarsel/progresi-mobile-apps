import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InputSafetyTrouble } from './InputSafetyTrouble';
import { LibsModule } from 'components/libs.module';
import { TagInputModule } from 'ngx-chips';

const routes: Routes = [
  {
    path: '',
    component: InputSafetyTrouble
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LibsModule,
    TagInputModule
  ],
  declarations: [InputSafetyTrouble]
})
export class InputSafetyTroubleModule {}

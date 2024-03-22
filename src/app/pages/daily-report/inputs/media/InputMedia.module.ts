import { Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InputMedia } from './InputMedia';
import { LibsModule } from 'components/libs.module';

const routes: Routes = [
  {
    path: '',
    component: InputMedia
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
  declarations: [InputMedia]
})
export class InputMediaModule {}

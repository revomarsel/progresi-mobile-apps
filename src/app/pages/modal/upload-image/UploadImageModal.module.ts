import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { UploadImageModal } from './UploadImageModal';

const routes: Routes = [
  {
    path: '',
    component: UploadImageModal
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [UploadImageModal],
  entryComponents: [UploadImageModal]
})
export class UploadImageModalModule {}

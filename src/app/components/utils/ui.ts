
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import get from 'lodash/get';
import { DetailsPage } from '../../pages/modal/details/details.page';
import { WebServiceProvider } from "providers/services-provider";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController
} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UIUtils {

  constructor(
    private ws: WebServiceProvider,
    public modalCtrl: ModalController,
  ) { }

  async getFullSummary(id, title, template, baseline?) {
    await this.ws.getFullSummaryAnalytics(id, template, baseline).then((res: any) => {
      this.showFullSummary(title, res, template);
    });
  }

  async showFullSummary(title, data, template) {
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { title: title, value: data, template: template }
    });
    return await modal.present();
  }

  async projectScheduleSummary(title, data) {
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { title: title, value: data, template: 'project_summary' }
    });
    return await modal.present();
  }

  async showWeatherDetails(title, data) {
    console.log(data);
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { title: title, value: data, template: 'weather_details' }
    });
    return await modal.present();
  }

  async getSubconTaskHistory(id, title, template) {
    const data = await this.ws.getAPI('/apiService/getSubconTaskHistory', {
      id: id
    });
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { title: title, value: get(data, 'data'), template: template }
    });
    return await modal.present();
  }

}

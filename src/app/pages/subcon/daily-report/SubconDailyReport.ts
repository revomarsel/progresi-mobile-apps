import { Component } from '@angular/core';
import { WebServiceProvider } from "providers/web-service";
import { NavServiceProvider } from "providers/nav-service";
import { AlgorithmServiceProvider } from "providers/algorithm-service";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController
} from '@ionic/angular';
import { AppComponent } from "app/app.component";
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import get from 'lodash/get';

@Component({
  selector: 'app-subcon-daily-report',
  templateUrl: './SubconDailyReport.html'
})
export class SubconDailyReport {

  props: any = {
    title: 'Laporan Harian Subcon',
    isRoot: false
  };
  auth: any;
  id: string = this.router.snapshot.paramMap.get('id');
  data: any;
  paging = 10;
  minDate: any;
  maxDate: any;
  availableDays: any;
  cache = {
    'key': this.app.auth.user.username + '-subcon-daily-report-' + this.id,
    'group_key': 'api_data',
    'ttl': 100
  };

  constructor(
    private ws: WebServiceProvider,
    public app: AppComponent,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public navService: NavServiceProvider,
    public alpro: AlgorithmServiceProvider,
    public router: ActivatedRoute
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    await this.app.cache.getItem(this.cache.key).then(() => {
      if (!this.data.details || !this.data.baselines)
        this.getData();
    }).catch(() => {
      this.getData();
    });
  }

  async getData(refresh?) {
    if (refresh)
      await this.app.cache.removeItems(this.cache.key);
    const res = await this.app.cache.getOrSetItem(this.cache.key,
      () => this.ws.getAPI('apiService/GetSubconLaporanHarianDate',
        {
          id: this.id
        }
      ).then((res: any) => {
        return res;
      }), this.cache.group_key, this.cache.ttl
    );
    this.data = get(res, 'data');
    this.minDate = '';
    this.maxDate = '';
    this.availableDays = [];
    this.data && this.data.forEach((val) => {
      val.id && this.availableDays.push({
        id: val.id,
        day: val.date,
        date_created: val.date_created
      });
    });
    if (this.availableDays.length > 0) {
      this.minDate = this.availableDays[this.availableDays.length - 1].day;
      this.maxDate = this.availableDays[0].day;
    }
  }

  searchReport(ev) {
    const date = moment(ev.detail.value, "YYYY-MM-DD").format("YYYY-MM-DD");
    const days = this.availableDays.map((item) => {
      return item.day;
    });
    const index = days.indexOf(date);
    if (index > -1) {
      this.navPage(this.availableDays[index]);
    } else {
      this.ws.showAlert('Laporan belum diinputkan');
    }
  }

  navigatePage(url) {
    this.navCtrl.navigateForward(url);
  }

  expandData(id) {
    const isElement = (element) => element.id === id;
    const index = this.data.findIndex(isElement);
    this.data[index].expanded = !this.data[index].expanded;
  }

  async navPage(val) {
    const date = val.day ? val.day : val.date;
    if (!val.date_created) {
      this.navCtrl.navigateForward(`subcon-reports/${this.id}/${date}/${val.id}`);
    } else {
      this.navCtrl.navigateForward(`subcon-reports/${this.id}/${date}/${val.id}`);
    }
    await this.app.cache.removeItems(this.cache.key);
  }

  async ionRefresh(event) {
    console.log('Pull Event Triggered!');
    await this.getData(true);
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  loadData(event) {
    setTimeout(() => {
      if (this.data.length < this.data.length) this.data = this.alpro.pageData(this.data, this.data.length + this.paging);
      event.target.complete();
      if (this.data.length === this.data.length) {
        event.target.disabled = true;
      }
    }, 500);
  }

}

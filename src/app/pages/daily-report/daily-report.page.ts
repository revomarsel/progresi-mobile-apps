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
  selector: 'app-daily-report',
  templateUrl: './daily-report.page.html',
  styleUrls: ['./daily-report.page.scss'],
})
export class DailyReportPage {

  props: any = {
    title: 'Laporan Harian',
    isRoot: false,
    popover: {
      enable: true,
      items: [
        {
          func: () => {
            this.navCtrl.navigateForward(`checklist/${this.id}`);
          }, text: 'Checklist', icon: 'checkmark', toggle: () => { }
        },
        {
          func: () => {
            alert('coming soon')
          }, text: 'Pegajuan Capaian', icon: 'list-outline', toggle: () => { }
        }
      ]
    },
  };
  auth: any;
  id: string = this.router.snapshot.paramMap.get('id');
  data: any;
  data_paging: any;
  paging = 10;
  minDate: any;
  maxDate: any;
  availableDays: any;
  cache = {
    'key': this.app.auth.user.username + '-daily-report-' + this.id,
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
    this.data = await this.app.cache.getOrSetItem(this.cache.key,
      () => this.ws.getAPI('apiService/getProjectDailyReports',
        {
          id: this.id
        }
      ).then((res: any) => {
        return res;
      }), this.cache.group_key, this.cache.ttl
    );
    
    this.minDate = '';
    this.maxDate = '';
    this.availableDays = [];
    this.data && this.data.forEach((val) => {
      let isEditable = false;
      let isComplete = true;
      val['expanded'] = false;
      val.reports.reverse();
      val.reports.forEach((val) => {
        if (val.id != null) {
          this.availableDays.push({
            rid: val.id,
            day: val.day
          });
        }
        if (val.status === 'Create' && isComplete) {
          isComplete = false;
        }
        if (val.status === 'Editable' || val.status === 'Create') isEditable = true;
      })
      val['isComplete'] = isComplete;
      val['isEditable'] = isEditable;
    });
    if (this.availableDays.length > 0) {
      this.minDate = this.availableDays[0].day;
      this.maxDate = this.availableDays[this.availableDays.length - 1].day;
    }
    this.data_paging = this.alpro.pageData(this.data, this.paging);
    
    console.log('sac', this.data_paging)
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
    //Create, Libur, Editable, Empty, Readonly
    // this.navService.setAvailableDailyReportsList(this.availableDays);
    // if (val.status === 'Create') this.navCtrl.navigateForward(`input-daily-task-batch/${this.id}/${val.day}/create`);
    if (val.status === 'Create') {
      const rid = await this.ws.postAPI('/apiService/generateReport', {
        date: val.day,
        id_project: this.id,
        id_user: this.app.auth.user.userid
      });
      this.navCtrl.navigateForward(`projects-reports/${this.id}/${val.day}/${get(rid, 'data.rid')}`);
    } else {
      this.navCtrl.navigateForward(`projects-reports/${this.id}/${val.day}/${val.id}`);
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
      if (this.data_paging.length < this.data.length) this.data_paging = this.alpro.pageData(this.data, this.data_paging.length + this.paging);
      event.target.complete();
      if (this.data_paging.length === this.data.length) {
        event.target.disabled = true;
      }
    }, 500);
  }

  alertContent(e, status) {
    if (status === 'Empty') alert('Laporan Harian kosong');
    else if (status === 'Libur') alert('Laporan Harian hari libur');
    e.stopPropagation();
  }

}

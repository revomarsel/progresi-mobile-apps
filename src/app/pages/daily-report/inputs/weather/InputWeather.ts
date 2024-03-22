import { Component } from '@angular/core';
import { WebServiceProvider } from "providers/web-service";
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
import get from 'lodash/get';
import { ConcurrencyServiceProvider } from "providers/concurrency-service";
import { UploadImageModal } from 'modals/upload-image/UploadImageModal';

@Component({
  selector: 'InputWeather',
  templateUrl: './InputWeather.html'
})
export class InputWeather {

  props: any = {
    title: 'Cuaca',
    isRoot: false,
    headerOptions: {
      buttons: [
        {
          func: () => {
            this.addData();
          }, icon: 'add-sharp'
        },
        {
          func: () => {
            this.uploadImage();
          }, icon: 'camera-sharp'
        },
        {
          func: () => {
            this.postData();
          }, icon: 'save-sharp'
        }
      ]
    },
  };
  auth: any;
  data: any;
  navigator: any;
  selectedTimeIdx: number = 0;
  selectedTime: any = null;
  expandNavigator: boolean = false;
  projectId: number = Number(this.router.snapshot.paramMap.get('pid'));
  day: any = this.router.snapshot.paramMap.get('date');
  weatherList: any;
  timeList: any;
  isViewMode: boolean = false;
  deletedList: any = [];
  preSelectItemIdx: number = Number(this.router.snapshot.paramMap.get('item'));
  medias: any = [];

  constructor(
    private ws: WebServiceProvider,
    public app: AppComponent,
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public router: ActivatedRoute,
    private concurrency: ConcurrencyServiceProvider
  ) {
    this.auth = this.app.auth;
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    this.app.menuEnable = false;
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    this.concurrency.start(
      {
        id_project: this.projectId,
        page: "cuaca",
        date: this.day,
        id_user: this.app.auth.user.userid,
      },
      () => this.postData(true)
    );
    await this.getData();
    if (this.preSelectItemIdx) {
      let itemIdx = 0;
      this.data && this.data.map((item, idx) => {
        if (item.id === this.preSelectItemIdx) itemIdx = idx;
      })
      this.changeselectedTime(itemIdx);
    } else {
      if (!this.data || this.data.length < 1) this.addData();
      this.changeselectedTime(this.data.length-1);
    }
  }

  async ionViewWillLeave() {
    this.concurrency.stop();
    this.app.menuEnable = true;
  }

  async ionViewCanLeave(): Promise<Boolean> {
    alert('leave');
    const res = await false;
    return res;
  }

  async getData(refresh?) {

    const time = await this.ws.getWeatherTimeList(this.projectId, this.day);
    this.timeList = get(time, 'data');

    const data = await this.ws.getWeatherInput(this.projectId, this.day);
    this.data = get(data, 'data');
    this.isViewMode = get(data, 'view_mode');
    this.medias = get(data, 'medias');

    this.weatherList = [
      { name: 'Gerimis', icon: 'rainy-sharp' },
      { name: 'Hujan', icon: 'thunderstorm-sharp' }
    ];

    this.data && this.data.map(val => {
      val.time_start = val.time.split(' - ')[0];
      val.time_end = val.time.split(' - ')[1];
    })
    this.data && this.selectTime();
    if (!this.data || this.data.length < 1) this.addData();
  }

  selectTime() {
    this.selectedTime = this.data[this.selectedTimeIdx] && {
      id: this.data[this.selectedTimeIdx].id,
      info: this.data[this.selectedTimeIdx].info,
      time: this.data[this.selectedTimeIdx].time,
      time_start: this.data[this.selectedTimeIdx].time_start,
      time_end: this.data[this.selectedTimeIdx].time_end,
      weather: this.data[this.selectedTimeIdx].weather
    }
  }

  searchDong(ev) {
    console.log('ada', ev)
  }

  changeselectedTime(idx) {
    this.selectedTimeIdx = idx;
    this.selectTime();
    this.expandNavigator = false;
  }

  changeWeather(val: string) {
    this.data[this.selectedTimeIdx].weather = val;
  }

  async postData(forceExit?) {
    console.log(this.data)
    if (this.isViewMode) {
      alert('Laporan harian telah lewat batas waktu pengisian');
      return null;
    }
    let isValid = true;
    let alertMsg = [
      { msg: 'Time masih kosong', appear: false },
      { msg: 'Kendala cuaca masih kosong', appear: false }
    ];
    this.data.map(item => {
      if (!item.time) {
        alertMsg[0].appear = true;
        isValid = false;
      }
      if (!item.weather) {
        alertMsg[1].appear = true;
        isValid = false;
      }
    })
    if (isValid) {
      this.saveData();
    } else {
      let alertStr = '';
      alertMsg.map(item => {
        if (item.appear) alertStr += `- ${item.msg}\n`;
      });
      alert(`Input belum lengkap/salah:\n${alertStr}`);
      this.saveData(); //Save even it's error
      if (forceExit) this.exitForm();
    }
  }

  async saveData() {
    const payload = {
      id_project: this.projectId,
      date: this.day,
      id_user: this.app.auth.user.userid,
      data: this.data,
      medias: this.medias,
      deleted: this.deletedList
    }
    const res = await this.ws.postAPI('apiService/PostWeather', payload);
    if (res) {
      alert('Post Success');
      this.exitForm();
    } else {
      alert('Post Failed');
    }
  }

  exitForm() {
    this.app.setDirty(false);
    this.navCtrl.pop();
    this.navCtrl.back();
  }

  addData() {
    if (this.isViewMode) {
      alert('Tidak dapat update cuaca, laporan harian telah lewat batas waktu pengisian');
      return null;
    }
    const data = {
      id: null,
      info: null,
      time: null,
      time_start: null,
      time_end: null,
      weather: null
    };
    if (!this.data) this.data = [];
    this.data.push(data);
  }

  async changeTime(ev: any, option: string) {
    this.data[this.selectedTimeIdx][option] = ev.value['time'];
    const start = this.data[this.selectedTimeIdx]['time_start'];
    const end = this.data[this.selectedTimeIdx]['time_end'];
    this.data[this.selectedTimeIdx]['time'] = `${start ? start : '00:00'
      } - ${end ? end : start ? start : '00:00'
      }`;
    this.selectTime();
  }

  deleteData(idx: number, id: number) {
    if (id) {
      if (!this.deletedList) this.deletedList = [];
      this.deletedList.push(id);
    }
    if (confirm('Apakah anda yakin ingin menghapus material?')) {
      this.data.splice(idx, 1);
    }
    if (this.selectedTimeIdx === 0) this.selectedTimeIdx++;
    else this.selectedTimeIdx--;
  }

  calculateProgress() {
    const capaianHariIni = Number(this.data[this.selectedTimeIdx].completion);
    const cumCompletion = Number(this.data[this.selectedTimeIdx].cum_completion);
    const qty = Number(this.data[this.selectedTimeIdx].qty);
    const duration = Number(this.data[this.selectedTimeIdx].duration);

    const sumCompletion = Number(capaianHariIni + cumCompletion);
    const capaianTillNow = qty && duration && (sumCompletion / qty * 100);

    //calculate
    this.data[this.selectedTimeIdx].capaian = (capaianHariIni / qty / duration * 100).toFixed(2);
    this.data[this.selectedTimeIdx].sum_completion = sumCompletion.toFixed(2);
    this.data[this.selectedTimeIdx].capaian_till_now = capaianTillNow.toFixed(2);
  }

  async uploadImage() {
    const modal = await this.modalCtrl.create({
      component: UploadImageModal,
      componentProps: { data: this.medias, isViewMode: this.isViewMode, title: 'Cuaca', date: this.day }
    });
    return await modal.present();
  }

}

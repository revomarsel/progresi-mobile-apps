import { Component, ViewChild } from '@angular/core';
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
import { inputBatchValidator } from "components/utils/input"
import { IProps } from 'components/interfaces';
import get from 'lodash/get';
import sumBy from 'lodash/sumBy';
import { IonicSelectableComponent } from 'ionic-selectable';
import { excludeDuplicate } from 'components/filter';
import { ConcurrencyServiceProvider } from "providers/concurrency-service";
import { UploadImageModal } from 'modals/upload-image/UploadImageModal';

@Component({
  selector: 'InputWorker',
  templateUrl: './InputWorker.html'
})
export class InputWorker {

  @ViewChild('quickNavSelection') quickNavSelection: IonicSelectableComponent;
  props: IProps = {
    title: 'Pekerja',
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
    formOptions: {
      validations: {
        required: ['worker_type_id', 'qty'],
        min: [
          { key: 'day_multiplier', value: 0 },
          { key: 'hour_multiplier', value: 0 },
          { key: 'qty', value: 0 }
        ]
      }
    }
  };
  auth: any;
  data: any;
  navigator: any;
  selectedItemIdx: number = 0;
  selectedItem: any = null;
  expandNavigator: boolean = false;
  projectId: number = Number(this.router.snapshot.paramMap.get('pid'));
  date: any = this.router.snapshot.paramMap.get('date');
  itemsList: any;
  itemsListDefault: any;
  isViewMode: boolean = false;
  deletedList: any = [];
  errorMsg: any = [];
  totalCost: number;
  totalWorker: number;
  showQuickNav: boolean = true;
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
    this.app.setDirty(false);
    this.app.menuEnable = false;
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    this.concurrency.start({
      id_project: this.projectId,
      page: 'pekerja',
      date: this.date,
      id_user: this.app.auth.user.userid
    }, () => this.postData(true));
    await this.getData();
    if (this.preSelectItemIdx) {
      let itemIdx = 0;
      this.data && this.data.map((item, idx) => {
        if (item.worker_type_id === this.preSelectItemIdx) itemIdx = idx;
      })
      this.changeSelectedItem(itemIdx);
    } else {
      if (!this.data || this.data.length < 1) this.addData();
      this.changeSelectedItem(this.data.length-1);
    }
  }

  async ionViewWillLeave() {
    this.concurrency.stop();
    this.app.menuEnable = true;
  }

  async getData(refresh?) {
    const data = await this.ws.getAPI('apiService/getWorkerTypeInput', {
      pid: this.projectId,
      date: this.date
    });
    this.data = get(data, 'data.list');
    this.isViewMode = get(data, 'view_mode');
    this.medias = get(data, 'medias');

    const itemsList = await this.ws.getAPI('apiService/getWorkerTypeList', {
      pid: this.projectId,
      date: this.date
    });
    this.itemsList = get(itemsList, 'data');
    this.itemsListDefault = this.itemsList;
    
    if (this.data) {
      this.selectItem();
      this.calculateTotals();
    }
    if (!this.data || this.data.length < 1) this.addData();
  }

  selectItem() {
    this.selectedItem = this.data[this.selectedItemIdx] && {
      rhw_id: this.data[this.selectedItemIdx].rhw_id,
      id: this.data[this.selectedItemIdx].id,
      name: this.data[this.selectedItemIdx].name,
      day_multiplier: this.data[this.selectedItemIdx].day_multiplier,
      hour_multiplier: this.data[this.selectedItemIdx].hour_multiplier,
      qty: this.data[this.selectedItemIdx].qty,
      price: this.data[this.selectedItemIdx].price,
      price_hour: this.data[this.selectedItemIdx].price_hour,
      descr: this.data[this.selectedItemIdx].descr,
      worker_type_id: this.data[this.selectedItemIdx].worker_type_id
    }
  }

  changeSelectedItem(idx) {
    this.selectedItemIdx = idx;
    this.selectItem();
    this.expandNavigator = false;
  }

  async postData(forceExit?) {
    if (this.isViewMode) {
      alert('Laporan harian telah lewat batas waktu pengisian');
      return null;
    }
    const validation = inputBatchValidator(this.data, this.props.formOptions.validations);
    const isValid = get(validation, 'isValid');
    this.errorMsg = get(validation, 'errorMsg');
    const errIdx = get(validation, 'errIdx');
    if (isValid) {
      this.saveData();
    } else {
      alert(`Input belum lengkap/salah`);
      this.changeSelectedItem(errIdx);
      this.selectedItemIdx = errIdx;
      this.saveData(); //Save even it's error
      if (forceExit) this.exitForm();
    }
  }

  async saveData() {
    const payload = {
      id_project: this.projectId,
      date: this.date,
      id_user: this.app.auth.user.userid,
      data: this.data,
      medias: this.medias,
      deleted: this.deletedList
    }
    const res = await this.ws.postAPI('apiService/PostWorkerType', payload);
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
      alert('Tidak dapat update jumlah pekerja, laporan harian telah lewat batas waktu pengisian');
      return null;
    }
    const data = {
      rhw_id: null,
      id: null,
      name: null,
      day_multiplier: null,
      hour_multiplier: null,
      qty: null,
      price: null,
      price_hour: null,
      descr: null,
      worker_type_id: null
    };
    if (!this.data) this.data = [];
    this.data.push(data);
  }

  async changeItem(ev: any) {
    const keys = Object.keys(ev.value);
    keys.map(val => {
      this.data[this.selectedItemIdx][val] = ev.value[val]
    })
    this.app.setDirty();
  }

  deleteData(idx: number, id: number) {
    if (id) {
      if (!this.deletedList) this.deletedList = [];
      this.deletedList.push(id);
    }
    if (confirm('Apakah anda yakin ingin menghapus equipment?')) {
      this.data.splice(idx, 1);
      this.app.setDirty();
    }
    this.errorMsg[this.selectedItemIdx] = null; //empty error msg
    if (this.selectedItemIdx === 0) this.selectedItemIdx++;
    else this.selectedItemIdx--;
    this.changeSelectedItem(this.selectedItemIdx);
  }

  calculateTotals() {
    this.totalCost = 0;
    this.data && this.data.map(val => {
      this.totalCost += (Number(val.price * val.day_multiplier) + Number(val.price_hour * val.hour_multiplier)) * val.qty;
    });
    this.totalWorker = sumBy(this.data, 'qty');
    console.log(this.data)
  }

  quickNavigation(ev: any) {
    this.quickNavSelection.clear();
    const idx = this.data.indexOf(ev.value);
    this.changeSelectedItem(idx);
  }

  async uploadImage() {
    const modal = await this.modalCtrl.create({
      component: UploadImageModal,
      componentProps: { data: this.medias, isViewMode: this.isViewMode, title: 'Jumlah Pekerja', date: this.date }
    });
    return await modal.present();
  }

}

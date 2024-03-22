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
import { IonicSelectableComponent } from 'ionic-selectable';
import { ConcurrencyServiceProvider } from "providers/concurrency-service";
import { UploadImageModal } from 'modals/upload-image/UploadImageModal';

@Component({
  selector: 'InputMaterialUsed',
  templateUrl: './InputMaterialUsed.html'
})
export class InputMaterialUsed {

  @ViewChild('quickNavSelection') quickNavSelection: IonicSelectableComponent;
  props: IProps = {
    title: 'Material Digunakan',
    isRoot: false,
    headerOptions: {
      buttons: [
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
        required: []
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
  isViewMode: boolean = false;
  errorMsg: any = [];
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
      page: 'material-digunakan',
      date: this.date,
      id_user: this.app.auth.user.userid
    }, () => this.postData(true));
    await this.getData();
    if (this.preSelectItemIdx) {
      let itemIdx = 0;
      this.data && this.data.map((item, idx) => {
        if (item.id === this.preSelectItemIdx) itemIdx = idx;
      })
      this.changeselectedItem(itemIdx);
    } else {
      if (!this.data || this.data.length < 1) this.addData();
      this.changeselectedItem(this.data.length-1);
    }
  }

  async ionViewWillLeave() {
    this.concurrency.stop();
    this.app.menuEnable = true;
  }

  async getData(refresh?) {
    const data = await this.ws.getAPI('apiService/getMaterialUsedInput', {
      pid: this.projectId,
      date: this.date
    });
    this.data = get(data, 'data');
    this.isViewMode = get(data, 'view_mode');
    this.medias = get(data, 'medias');
  }

  changeselectedItem(idx) {
    this.selectedItemIdx = idx;
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
      this.changeselectedItem(errIdx);
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
      medias: this.medias
    }
    const res = await this.ws.postAPI('apiService/PostMaterialUsed', payload);
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
      alert('Tidak dapat update material, laporan harian telah lewat batas waktu pengisian');
      return null;
    }
    const data = {
      id: null,
      price: null,
      supplier: null,
      qty: null,
      info: null,
      task_parent: null,
      task_name: null,
      material_id: null,
      material_name: null
    };
    if (!this.data) this.data = [];
    this.data.push(data);
  }

  quickNavigation(ev: any) {
    this.quickNavSelection.clear();
    const idx = this.data.indexOf(ev.value);
    this.changeselectedItem(idx);
  }

  async uploadImage() {
    const modal = await this.modalCtrl.create({
      component: UploadImageModal,
      componentProps: { data: this.medias, isViewMode: this.isViewMode, title: 'Material Digunakan', date: this.date }
    });
    return await modal.present();
  }

}

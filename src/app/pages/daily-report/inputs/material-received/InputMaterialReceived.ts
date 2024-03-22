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
import { searchItems, excludeDuplicate } from 'components/filter';
import { ConcurrencyServiceProvider } from "providers/concurrency-service";
import { UploadImageModal } from 'modals/upload-image/UploadImageModal';

@Component({
  selector: 'InputMaterialReceived',
  templateUrl: './InputMaterialReceived.html'
})

export class InputMaterialReceived {

  @ViewChild('batchSelection') batchSelection: IonicSelectableComponent;
  @ViewChild('quickNavSelection') quickNavSelection: IonicSelectableComponent;
  props: IProps = {
    title: 'Material Diterima',
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
        required: ['material_code', 'qty']
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
    this.menuCtrl.enable(false);
    this.app.setDirty(false);
    this.app.menuEnable = false;
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    this.concurrency.start({
      id_project: this.projectId,
      page: 'material-diterima',
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
    const data = await this.ws.getAPI('apiService/getMaterialReceivedInput', {
      pid: this.projectId,
      date: this.date
    });
    this.data = get(data, 'data');
    this.isViewMode = get(data, 'view_mode');
    this.medias = get(data, 'medias');

    const itemsList = await this.ws.getAPI('apiService/getMaterialReceivalList', {
      pid: this.projectId,
      date: this.date
    });
    this.itemsList = get(itemsList, 'data');
    this.itemsListDefault = this.itemsList;

    this.data && this.selectItem();
    if (!this.data || this.data.length < 1) this.addData();
    this.preventDuplicate();
  }

  selectItem() {
    this.selectedItem = this.data[this.selectedItemIdx] && {
      id: this.data[this.selectedItemIdx].id,
      price: this.data[this.selectedItemIdx].price,
      supplier: this.data[this.selectedItemIdx].supplier,
      material_id: this.data[this.selectedItemIdx].material_id,
      material_name: this.data[this.selectedItemIdx].material_name,
      material_code: this.data[this.selectedItemIdx].material_code,
      task_parent: this.data[this.selectedItemIdx].task_parent,
      task_name: this.data[this.selectedItemIdx].task_name,
      material_unit: this.data[this.selectedItemIdx].material_unit
    }
  }

  changeselectedItem(idx) {
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
      medias: this.medias,
      deleted: this.deletedList
    }
    const res = await this.ws.postAPI('apiService/PostMaterialReceived', payload);
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

  async changeItem(ev: any) {
    const keys = Object.keys(ev.value);
    keys.map(val => {
      this.data[this.selectedItemIdx][val] = ev.value[val]
    })
  }

  deleteData(idx: number, id: number) {
    if (id) {
      if (!this.deletedList) this.deletedList = [];
      this.deletedList.push(id);
    }
    if (confirm('Apakah anda yakin ingin menghapus material?')) {
      this.data.splice(idx, 1);
    }
    this.errorMsg[this.selectedItemIdx] = null; //empty error msg
    if (this.selectedItemIdx === 0) this.selectedItemIdx++;
    else this.selectedItemIdx--;
    this.changeselectedItem(this.selectedItemIdx);
  }

  selectBatch(ev: any) {
    this.batchSelection.clear();
    if (ev.value.length < 1) return;
    const itemBatch = ev.value;
    itemBatch.map(item => {
      this.data.push(item);
    });
  }

  searchBatch(event: {
    component: IonicSelectableComponent,
    text: string
  }, defaultItems: any) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (!text) {
      event.component.items = defaultItems;
      event.component.endSearch();
      return;
    }
    event.component.items = searchItems(defaultItems, text, ['material_name', 'task_name', 'task_parent']);
    event.component.endSearch();
  }

  quickNavigation(ev: any) {
    this.quickNavSelection.clear();
    const idx = this.data.indexOf(ev.value);
    this.changeselectedItem(idx);
  }

  preventDuplicate() {
    this.itemsList = excludeDuplicate(this.data, this.itemsListDefault, 'thm_id');
  }

  amountChanged(event: number) {
    this.data[this.selectedItemIdx].price = event;
  }

  async uploadImage() {
    const modal = await this.modalCtrl.create({
      component: UploadImageModal,
      componentProps: { data: this.medias, isViewMode: this.isViewMode, title: 'Material Diterima', date: this.date }
    });
    return await modal.present();
  }

}

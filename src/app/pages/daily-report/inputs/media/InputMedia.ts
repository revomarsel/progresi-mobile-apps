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
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { getImageUrl } from 'components/utils';
import { ConcurrencyServiceProvider } from "providers/concurrency-service";

@Component({
  selector: 'InputMedia',
  templateUrl: './InputMedia.html'
})
export class InputMedia {

  props: any = {
    title: 'Media',
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
            this.postData();
          }, icon: 'save-sharp'
        }
      ]
    },
  };
  auth: any;
  data: any;
  navigator: any;
  selectedMediaIdx: number = 0;
  selectedMedia: any = null;
  expandNavigator: boolean = false;
  projectId: number = Number(this.router.snapshot.paramMap.get('pid'));
  day: any = this.router.snapshot.paramMap.get('date');
  isViewMode: boolean = false;
  deletedList: any = [];
  preSelectItemIdx: number = Number(this.router.snapshot.paramMap.get('item'));

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
    private sanitizer: DomSanitizer,
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
        page: "media",
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
      this.changeSelectedMedia(itemIdx);
    } else {
      if (!this.data || this.data.length < 1) this.addData();
      this.changeSelectedMedia(this.data.length-1);
    }
  }

  async ionViewWillLeave() {
    this.concurrency.stop();
    this.app.menuEnable = true;
  }

  async getData(refresh?) {

    const data = await this.ws.getAPI(
      'apiService/getMediaInput',
      {
        pid: this.projectId,
        date: this.day
      }
    );
    this.data = get(data, 'data');
    this.isViewMode = get(data, 'view_mode');

    this.data && this.selectMedia();
    if (!this.data || this.data.length < 1) this.addData();
  }

  selectMedia() {
    this.selectedMedia = this.data[this.selectedMediaIdx] && {
      id: this.data[this.selectedMediaIdx].id,
      info: this.data[this.selectedMediaIdx].info,
      url: this.data[this.selectedMediaIdx].url,
      file: this.data[this.selectedMediaIdx].file
    }
  }

  changeSelectedMedia(idx) {
    this.selectedMediaIdx = idx;
    this.selectMedia();
    this.expandNavigator = false;
  }

  async postData(forceExit?) {
    if (this.isViewMode) {
      alert('Laporan harian telah lewat batas waktu pengisian');
      return null;
    }
    let isValid = true;
    let alertMsg = [
      { msg: 'Gambar masih kosong', appear: false }
    ];
    this.data.map(item => {
      if (!item.url && !item.file) {
        alertMsg[0].appear = true;
        isValid = false;
      }
    })
    if (isValid) {
      const payload = {
        id_project: this.projectId,
        date: this.day,
        id_user: this.app.auth.user.userid,
        data: this.data,
        deleted: this.deletedList
      }
      const res = await this.ws.postAPI('apiService/PostMedia', payload);
      if (res) {
        alert('Post Success');
        this.navCtrl.pop();
        this.navCtrl.back();
      } else {
        alert('Post Failed');
      }
    } else {
      let alertStr = '';
      alertMsg.map(item => {
        if (item.appear) alertStr += `- ${item.msg}\n`;
      });
      alert(`Input belum lengkap/salah:\n${alertStr}`);
      if (forceExit) {
        this.app.setDirty(false);
        this.navCtrl.pop();
        this.navCtrl.back();
      }
    }
  }

  addData() {
    if (this.isViewMode) {
      alert('Tidak dapat update foto, laporan harian telah lewat batas waktu pengisian');
      return null;
    }
    const data = {
      id: null,
      info: null,
      url: null,
      file: null
    };
    if (!this.data) this.data = [];
    this.data.push(data);
  }

  deleteData(idx: number, id: number) {
    if (id) {
      if (!this.deletedList) this.deletedList = [];
      this.deletedList.push(id);
    }
    if (confirm('Apakah anda yakin ingin menghapus foto?')) {
      this.data.splice(idx, 1);
    }
    if (this.selectedMediaIdx === 0) this.selectedMediaIdx++;
    else this.selectedMediaIdx--;
  }

  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      saveToGallery: true,
      promptLabelHeader: 'Upload Foto',
      promptLabelCancel: 'Cancel',
      promptLabelPhoto: 'Dari Gallery',
      promptLabelPicture: 'Dari Kamera'
    });

    const photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
    const img = photo['changingThisBreaksApplicationSecurity'];

    this.data[this.selectedMediaIdx].file = img;
  }

  getRepoImage(img) {
    return getImageUrl(img);
  }
}

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

@Component({
  selector: 'InputSubconMedia',
  templateUrl: './InputSubconMedia.html'
})
export class InputSubconMedia {

  props: any = {
    title: 'Media Subcon',
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
    private sanitizer: DomSanitizer
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
    await this.getData();
  }

  async getData(refresh?) {

    const data = await this.ws.getAPI(
      'apiService/GetLaporanHarianSubconFoto',
      {
        pid: this.projectId,
        date: this.day
      }
    );
    this.data = get(data, 'data');

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

  async postData() {
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
      const res = await this.ws.postAPI('apiService/PostLaporanHarianSubconFoto', payload);
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

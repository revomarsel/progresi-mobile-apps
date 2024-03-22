import { Component } from "@angular/core";
import { WebServiceProvider } from "providers/web-service";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController,
} from "@ionic/angular";
import { AppComponent } from "../../../../../app.component";
import { ActivatedRoute } from "@angular/router";
import get from "lodash/get";
import { getImageUrl } from "components/utils";
import { Plugins, CameraResultType, CameraSource } from "@capacitor/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "InputFieldTrouble",
  templateUrl: "./InputFieldTrouble.html",
})
export class InputFieldTrouble {
  props: any = {
    title: "KENDALA LAPANGAN",
    isRoot: false,
    headerOptions: {
      buttons: [
        {
          func: () => {
            this.deleteData();
          },
          icon: "trash",
        },
        {
          func: () => {
            this.postData();
          },
          icon: "save-sharp",
        },
      ],
    },
  };
  auth: any;
  projectId: string = this.router.snapshot.paramMap.get("pid");
  id: string = this.router.snapshot.paramMap.get("id");
  data: any;
  itemsList: any;
  selectedTask: number = 1;
  deletedList: any;

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
    this.getData();
  }

  async getData(refresh?) {
    const data = await this.ws.getAPI("/apiService/getKendalaLapanganInput", {
      pid: this.projectId,
      id: this.projectId,
    });
    this.data = get(data, "data");

    const items = await this.ws.getAPI("/apiService/getKendalaTaskList", {
      pid: this.projectId,
    });
    this.itemsList = get(items, "data");
  }

  async postData() {
    const payload = {
      id_project: this.projectId,
      id_user: this.app.auth.user.userid,
      data: this.data,
      deleted: this.deletedList,
    };
    const res = await this.ws.postAPI(
      "/apiService/postKendalaLapangan",
      payload
    );
    if (res) {
      this.app.cache.removeItems(
        `${this.app.auth.user.username}-projectTroubles-${this.projectId}-field`
      );
      this.navCtrl.pop();
      this.navCtrl.back();
    }
  }

  getRepoImage(img) {
    return getImageUrl(img);
  }

  async deleteData() {
    if (!this.data) return null;
    if (this.data.closed_date_r) {
      alert("Kendala tidak dapat dihapus karena telah di close");
      return null;
    }
    if (!confirm("Apakah anda yakin ingin menghapus kendala ini?")) return null;
    const payload = {
      id_project: this.projectId,
      id_user: this.app.auth.user.userid,
      id: this.data && this.data.id,
    };
    const res = await this.ws.postAPI(
      "/apiService/deleteKendalaLapangan",
      payload
    );
    if (res) {
      this.app.cache.removeItems(
        `${this.app.auth.user.username}-projectTroubles-${this.projectId}-field`
      );
      this.navCtrl.pop();
      this.navCtrl.back();
    }
  }

  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      saveToGallery: true,
      promptLabelHeader: "Upload Foto",
      promptLabelCancel: "Cancel",
      promptLabelPhoto: "Dari Gallery",
      promptLabelPicture: "Dari Kamera",
    });

    const photo = this.sanitizer.bypassSecurityTrustResourceUrl(
      image && image.dataUrl
    );
    const img = photo["changingThisBreaksApplicationSecurity"];

    if (this.data && !this.data.images) this.data.images = [];
    this.data.images.push({ file: img });
  }

  deleteImage(idx: number, id: number) {
    if (id) {
      if (!this.deletedList) this.deletedList = [];
      this.deletedList.push(id);
    }
    if (confirm("Apakah anda yakin ingin menghapus foto?")) {
      this.data.splice(idx, 1);
    }
  }
}

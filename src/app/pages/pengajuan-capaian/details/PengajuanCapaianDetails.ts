import { Component, ViewChild } from "@angular/core";
import { WebServiceProvider } from "providers/web-service";
import {
  NavController,
  AlertController,
  MenuController,
  ToastController,
  PopoverController,
  ModalController,
  IonContent,
} from "@ionic/angular";
import { AppComponent } from "../../../app.component";
import { DetailsPage } from "../../modal/details/details.page";
import { VirtualScrollerComponent } from "ngx-virtual-scroller";
import { IProps, ICache } from "components/interfaces";
import { get } from "lodash";
import { ActivatedRoute } from "@angular/router";
import { UploadImageModal } from "modals/upload-image/UploadImageModal";

@Component({
  selector: "app-pengajuancapaian-details",
  templateUrl: "./PengajuanCapaianDetails.html",
})
export class PengajuanCapaianDetails {
  @ViewChild("scroll") scroller: VirtualScrollerComponent;
  props: IProps = {
    title: "Detail Capaian",
    isRoot: false,
    search: {
      enable: false,
    },
    headerOptions: {
      buttons: [
        {
          func: () => {
            this.postData("draft", null);
          },
          icon: "bookmark",
        },
        {
          func: () => {
            this.postData("submitted", null);
          },
          icon: "save-sharp",
        },
      ],
    },
  };
  id: number = Number(this.router.snapshot.paramMap.get("id"));
  pid: number = Number(this.router.snapshot.paramMap.get("pid"));
  cache: ICache = {
    key: this.app.auth.user.username + "-pengajuan-details-" + this.id,
    group_key: "api_data",
    ttl: 60 * 60 * 24,
  };
  searchKey = "";
  dataView: any;
  isDataEmpty: boolean = false;
  inputMode: boolean = false;
  tasks: any;
  selectedTask: any;
  parentTask: string;
  roleName: string;
  taskName: string;
  isViewMode: boolean;
  is_draft: boolean;
  data: any;
  medias: any;
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
    public router: ActivatedRoute
  ) {}

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  eventHandler(ev) {
    if (ev.func !== undefined) ev.func();
  }

  async ionViewDidEnter() {
    this.isDataEmpty = false;
    await this.app.cache
      .getItem(this.cache.key)
      .then(() => {
        if (this.data == null) this.getData();
      })
      .catch(() => {
        this.getData();
      });
    this.app.appPages[2].extraFunc = () => {
      this.scroller.scrollToIndex(0);
    };
  }

  async getData(refresh?) {
    const res = await this.ws.getAPI("/apiService/GetPengajuanProgressInput", {
      id: this.id,
    });
    console.log("res", res);
    this.roleName = this.app.auth.user.UserRoles[0].role_name;
    this.data = get(res, "data");
    this.medias = get(res, "medias");
    this.isViewMode = get(res, "is_view_mode");
    this.is_draft = get(res, "is_draft");
    this.dataView = this.data;
    if (
      (!this.is_draft && this.roleName === "superadmin.") ||
      (!this.is_draft && this.roleName === "projectadmin.") ||
      (!this.is_draft && this.roleName === "projectmanager.")
    ) {
      this.props.headerOptions.buttons.splice(0, 1);
    }
    if (!this.is_draft || this.roleName === "projectowner.") {
      this.isViewMode = true;
      this.props.headerOptions.buttons.splice(0, 1);
      this.props.headerOptions.buttons.splice(0, 1);
    }
    if (this.data && this.data.length < 1) this.isDataEmpty = true;
    this.searchValue();
  }

  async showDetails(val: any) {
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { value: val, template: "projects" },
    });
    return await modal.present();
  }

  searchValue() {
    if (this.searchKey.trim() !== "") {
      this.dataView = this.data.filter((item) => {
        return (
          item.name.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
        );
      });
    } else {
      this.dataView = this.data;
    }
  }

  cancelSearch() {
    this.dataView = this.data;
  }

  async ionRefresh(event) {
    console.log("Pull Event Triggered!");
    await this.getData(true);
    event.target.disabled = true;
    event.target.complete();
    setTimeout(() => {
      event.target.disabled = false;
    }, 100);
  }

  handleSwipe(ev, search) {
    //to the left
    if (ev.direction == 2) this.navCtrl.navigateForward("pesan/" + search);
  }

  goToPesan(search) {
    this.navCtrl.navigateForward("pesan/" + search);
  }

  navigateProject(val) {
    console.log(val);
  }

  getImgUrl(data) {
    const url = encodeURI(this.app.auth.baseURL + data);
    return url;
  }

  addData() {
    if (this.isViewMode) {
      alert("Tidak dapat update checklist");
      return null;
    }
    const data = {
      admin: null,
      approval_progress_id: null,
      approved_time: null,
      approver_user: null,
      created_by: null,
      created_time: null,
      files: [],
      id: null,
      is_status: null,
      name: null,
      now_bobot: null,
      now_cum: null,
      owner: null,
      owner_r: null,
      parent_name: null,
      persen_capaian: null,
      pict: null,
      prev_bobot: null,
      prev_cum: null,
      qty: null,
      revisi_time: null,
      revisi_user: null,
      satuan: null,
      submitted_capaian: null,
      task_code: null,
      unit: null,
    };
    if (!this.data) this.data = [];
    this.data.unshift(data);
  }

  deleteData(idx: number, id: number) {
    if (id) {
      if (!this.deletedList) this.deletedList = [];
      this.deletedList.push(id);
    }
    if (confirm("Apakah anda yakin ingin menghapus capaian ?")) {
      this.data.splice(idx, 1);
    }
  }

  async postData(status: any, id_task: any) {
    if (id_task !== null) {
      if (!confirm("Apakah anda yakin untuk approve ?")) {
        return;
      }
    }
    const payload = {
      id_project: this.pid,
      id_user: this.app.auth.user.userid,
      id: this.id,
      id_task: id_task,
      data: this.data,
      status: status,
      deleted: this.deletedList,
    };
    const res = await this.ws.postAPI(
      "apiService/postPengajuanProgressDetail",
      payload
    );
    if (res) {
      alert("Post Success");
      this.getData(true);
      this.inputMode = false;
    } else {
      alert("Post Failed");
    }
  }

  async uploadImage(idx, type) {
    const modal = await this.modalCtrl.create({
      component: UploadImageModal,
      componentProps: {
        data: this.medias,
        isViewMode: this.isViewMode,
        title: `Foto ${type === "before" ? "Sebelum" : "Sesudah"}`,
      },
    });
    return await modal.present();
  }

  doCheck(role, idx) {
    this.data[idx][`is_checked_${role}`] === "N"
      ? (this.data[idx][`is_checked_${role}`] = "Y")
      : (this.data[idx][`is_checked_${role}`] = "N");
  }
}

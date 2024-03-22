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
  selector: "app-checklist-details",
  templateUrl: "./ChecklistDetails.html",
})
export class ChecklistDetails {
  @ViewChild("scroll") scroller: VirtualScrollerComponent;
  props: IProps = {
    title: "Checklist Detail",
    isRoot: false,
    search: {
      enable: false,
    },
    headerOptions: {
      buttons: [
        {
          func: () => {
            this.postData();
          },
          icon: "save-sharp",
        },
      ],
    },
  };
  id: number = Number(this.router.snapshot.paramMap.get("id"));
  cache: ICache = {
    key: this.app.auth.user.username + "-checklist-details-" + this.id,
    group_key: "api_data",
    ttl: 60 * 60 * 24,
  };
  data: any;
  searchKey = "";
  dataView: any;
  isDataEmpty: boolean = false;
  inputMode: boolean = false;
  tasks: any;
  selectedTask: any;
  parentTask: string;
  taskName: string;
  isViewMode: boolean;
  checklistData: any;
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
    const res = await this.ws.getAPI("/apiService/GetChecklistInput", {
      id: this.id,
    });
    this.checklistData = get(res, "data");
    this.data = get(res, "data.details");
    this.parentTask = get(res, "data.parent");
    this.taskName = get(res, "data.name");
    this.isViewMode = get(res, "is_view_mode");
    this.dataView = this.data;
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

  goToDetails(id) {
    this.navCtrl.navigateForward("checklist-view/" + id);
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
      checked_time_admin: null,
      checked_time_owner: null,
      checker_admin: null,
      checker_owner: null,
      checklist_id: null,
      created_by: null,
      created_time: null,
      deskripsi: null,
      files_after: { data: [], deleted: [] },
      files_before: { data: [], deleted: [] },
      id: null,
      is_checked_admin: "N",
      is_checked_owner: "N",
      item: null,
      owner: null,
    };
    if (!this.data) this.data = [];
    this.data.unshift(data);
  }

  deleteData(idx: number, id: number) {
    if (id) {
      if (!this.deletedList) this.deletedList = [];
      this.deletedList.push(id);
    }
    if (confirm("Apakah anda yakin ingin menghapus checklist?")) {
      this.data.splice(idx, 1);
    }
  }

  async postData() {
    this.checklistData.details = this.data;
    const payload = {
      id_project: this.id,
      id_user: this.app.auth.user.userid,
      id: this.id,
      data: this.checklistData,
      deleted: this.deletedList,
    };
    console.log("payload", payload);
    const res = await this.ws.postAPI(
      "apiService/postChecklistDetail",
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
    console.log(this.data[idx][`files_${type}`]);
    const modal = await this.modalCtrl.create({
      component: UploadImageModal,
      componentProps: {
        data: this.data[idx][`files_${type}`],
        isViewMode: this.isViewMode,
        title: `Foto ${type === "before" ? "Sebelum" : "Sesudah"}`,
      },
    });
    return await modal.present();
  }

  doCheck(role, idx) {
    if (
      this.app.auth.user.UserRoles[0].id === 8 &&
      this.data[idx]["is_checked_admin"] !== "Y"
    ) {
      alert("Checklist harus disetujui oleh kontraktor terlebih dahulu");
      return;
    }
    if (this.data[idx]["is_checked_owner"] === "Y") {
      alert("Checklist telah disetujui oleh owner");
      return;
    }
    this.data[idx][`is_checked_${role}`] === "N"
      ? (this.data[idx][`is_checked_${role}`] = "Y")
      : (this.data[idx][`is_checked_${role}`] = "N");
  }

  async showHistory(id) {
    const data = await this.ws.getAPI("/apiService/getChecklistLog", {
      id: id,
      pid: this.id,
    });
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { value: get(data, "data"), template: "capaian_log" },
    });
    return await modal.present();
  }
}

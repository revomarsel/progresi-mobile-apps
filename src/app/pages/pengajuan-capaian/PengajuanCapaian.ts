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
import { AppComponent } from "../../app.component";

import { DetailsPage } from "../modal/details/details.page";
import { VirtualScrollerComponent } from "ngx-virtual-scroller";
import { IProps, ICache } from "components/interfaces";
import { get } from "lodash";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-pengajuan-capaian",
  templateUrl: "./PengajuanCapaian.html",
})
export class PengajuanCapaian {
  @ViewChild("scroll") scroller: VirtualScrollerComponent;
  props: IProps = {
    title: "Pengajuan Capaian",
    isRoot: false,
    search: {
      enable: false,
    },
  };
  cache: ICache = {
    key: this.app.auth.user.username + "-pengajuan-capaian",
    group_key: "api_data",
    ttl: 60 * 60 * 24,
  };
  data: any;
  user: any;
  searchKey = "";
  defaultItems: any;
  isDataEmpty: boolean = false;
  pid: number = Number(this.router.snapshot.paramMap.get("pid"));
  inputMode: boolean = false;
  tasks: any;
  selectedTask: any;
  deletedList: any;
  deadlineDate: any;
  capaianName: string;
  roleName: string;

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
    await this.getFilters();
  }

  async getData(refresh?) {
    this.user = this.app.auth.user;
    if (refresh) await this.app.cache.removeItems(this.cache.key);
    const res = await this.app.cache.getOrSetItem(
      this.cache.key,
      () =>
        this.ws
          .getAPI("/apiService/GetPengajuanProgress", {
            pid: this.pid,
          })
          .then((res: any) => {
            return res;
          }),
      this.cache.group_key,
      this.cache.ttl
    );
    this.roleName = this.app.auth.user.UserRoles[0].role_name;
    this.data = get(res, "data");
    this.defaultItems = this.data;
    if (this.data && this.data.length < 1) this.isDataEmpty = true;
    this.searchValue();
  }

  async getFilters() {
    const tasks = await this.ws.getAPI("/apiService/getTasks", {
      pid: this.pid,
    });
    this.tasks = get(tasks, "data.list");
  }

  async showDetails(val: any) {
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { value: val, template: "projects" },
    });
    return await modal.present();
  }

  goToDetails(id) {
    this.navCtrl.navigateForward(`pengajuan-capaian-details/${this.pid}/${id}`);
  }

  searchValue() {
    if (this.searchKey.trim() !== "") {
      this.data = this.defaultItems.filter((item) => {
        return (
          item.name.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1
        );
      });
    } else {
      this.data = this.defaultItems;
    }
  }

  cancelSearch() {
    this.data = this.defaultItems;
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

  deleteData(idx: number, id: number) {
    if (id) {
      if (!this.deletedList) this.deletedList = [];
      this.deletedList.push(id);
    }
    if (confirm("Apakah anda yakin ingin menghapus pengajuan capaian?")) {
      this.data.splice(idx, 1);
    }
    this.postData();
  }

  async postData() {
    const payload = {
      id_project: this.pid,
      id_user: this.app.auth.user.userid,
      data: {
        name: this.capaianName,
        tasks: this.selectedTask,
        deadline: this.deadlineDate,
      },
      deletedList: [],
    };
    if (!this.capaianName || !this.selectedTask || !this.deadlineDate) {
      let errStr = "";
      if (!this.capaianName) errStr += "- Nama harus diinputkan\n";
      if (!this.deadlineDate) errStr += "- Deadline harus diinputkan\n";
      if (!this.selectedTask) errStr += "- Task harus diinputkan\n";
      alert(errStr);
      return;
    }

    const res = await this.ws.postAPI(
      "apiService/postPengajuanProgress",
      payload
    );
    if (res) {
      alert("Post Success");
      this.getData(true);
      this.inputMode = false;
      this.navCtrl.navigateForward(
        `pengajuan-capaian-details/${this.pid}/${res.id}`
      );
    } else {
      alert("Post Failed");
    }
  }
}

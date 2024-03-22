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
  selector: "app-checklist",
  templateUrl: "./Checklist.html",
})
export class Checklist {
  @ViewChild("scroll") scroller: VirtualScrollerComponent;
  props: IProps = {
    title: "Checklist",
    isRoot: false,
    search: {
      enable: false,
    },
  };
  pid: number = Number(this.router.snapshot.paramMap.get("pid"));
  cache: ICache = {
    key: this.app.auth.user.username + "-checklist-" + this.pid,
    group_key: "api_data",
    ttl: 60 * 60 * 24,
  };
  data: any;
  searchKey = "";
  defaultItems: any;
  isDataEmpty: boolean = false;
  inputMode: boolean = false;
  tasks: any;
  selectedTask: any;
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
    await this.getFilters();
  }

  async getData(refresh?) {
    if (refresh) await this.app.cache.removeItems(this.cache.key);
    const res = await this.app.cache.getOrSetItem(
      this.cache.key,
      () =>
        this.ws
          .getAPI("apiService/getChecklist", {
            pid: this.pid,
          })
          .then((res: any) => {
            return res;
          }),
      this.cache.group_key,
      this.cache.ttl
    );
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
    this.navCtrl.navigateForward("checklist-details/" + id);
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
    if (confirm("Apakah anda yakin ingin menghapus checklist?")) {
      this.data.splice(idx, 1);
    }
    this.postData();
  }

  async postData() {
    const payload = {
      id_project: this.pid,
      id_user: this.app.auth.user.userid,
      data: this.selectedTask,
      deleted: this.deletedList,
    };
    const res = await this.ws.postAPI("apiService/postChecklist", payload);
    if (res) {
      alert("Post Success");
      this.getData(true);
      this.inputMode = false;
      this.deletedList = [];
    } else {
      alert("Post Failed");
    }
    this.selectedTask = null;
  }
}
